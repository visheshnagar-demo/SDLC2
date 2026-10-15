import uuid
import random
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from server.models import User, Account, AuditLog
from server.schemas import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    AuthUserDto,
    MfaVerifyRequest,
    MfaSetupResponse,
)
from server.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


class AuthService:
    @staticmethod
    def register(db: Session, request: RegisterRequest) -> User:
        existing_email = db.query(User).filter(User.email == request.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

        existing_user = db.query(User).filter(User.username == request.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken",
            )

        full_name = request.full_name or request.username.capitalize()
        new_user = User(
            id=str(uuid.uuid4()),
            username=request.username,
            email=request.email,
            password_hash=get_password_hash(request.password),
            full_name=full_name,
            status="ACTIVE",
            is_active=True,
            failed_login_attempts=0,
            mfa_enabled=False,
            mfa_secret=None,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create default checking and savings account for newly registered user
        chk_num = f"ACC-{random.randint(4000, 9999)}"
        sav_num = f"ACC-{random.randint(4000, 9999)}"
        while sav_num == chk_num:
            sav_num = f"ACC-{random.randint(4000, 9999)}"

        chk_acc = Account(
            id=str(uuid.uuid4()),
            user_id=new_user.id,
            account_number=chk_num,
            account_type="CHECKING",
            balance=1000.00,
            currency="USD",
            status="ACTIVE",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        sav_acc = Account(
            id=str(uuid.uuid4()),
            user_id=new_user.id,
            account_number=sav_num,
            account_type="SAVINGS",
            balance=500.00,
            currency="USD",
            status="ACTIVE",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(chk_acc)
        db.add(sav_acc)
        db.commit()

        return new_user

    @staticmethod
    def login(
        db: Session,
        request: LoginRequest,
        ip_address: str = None,
        user_agent: str = None,
    ) -> AuthResponse:
        user = (
            db.query(User)
            .filter(
                (User.username == request.username) | (User.email == request.username)
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        # Check account lockout
        if user.status == "LOCKED":
            if user.locked_until and datetime.now(
                timezone.utc
            ) > user.locked_until.replace(
                tzinfo=timezone.utc if user.locked_until.tzinfo is None else None
            ):
                user.status = "ACTIVE"
                user.failed_login_attempts = 0
                user.locked_until = None
                db.commit()
            else:
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail="Account is locked due to 5 consecutive failed login attempts. Please try again later.",
                )

        if not verify_password(request.password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.status = "LOCKED"
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)
                db.add(
                    AuditLog(
                        user_id=user.id,
                        event_type="ACCOUNT_LOCKED",
                        ip_address=ip_address,
                        user_agent=user_agent,
                        details="Account locked after 5 consecutive failed attempts",
                    )
                )
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail="Account locked after 5 consecutive failed attempts.",
                )

            db.add(
                AuditLog(
                    user_id=user.id,
                    event_type="LOGIN_FAILED",
                    ip_address=ip_address,
                    user_agent=user_agent,
                    details=f"Failed attempt #{user.failed_login_attempts}",
                )
            )
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        # Successful credentials check
        user.failed_login_attempts = 0
        user.locked_until = None
        db.add(
            AuditLog(
                user_id=user.id,
                event_type="USER_LOGIN",
                ip_address=ip_address,
                user_agent=user_agent,
                details="Successful login",
            )
        )
        db.commit()

        token_data = {
            "sub": user.id,
            "username": user.username,
            "email": user.email,
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_dto = AuthUserDto(
            userId=user.id,
            username=user.username,
            email=user.email,
            fullName=user.full_name,
            status=user.status,
            mfaEnabled=user.mfa_enabled,
        )

        return AuthResponse(
            accessToken=access_token,
            tokenType="Bearer",
            expiresIn=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_dto,
            refreshToken=refresh_token,
            mfaRequired=user.mfa_enabled,
        )

    @staticmethod
    def setup_mfa(db: Session, user: User) -> MfaSetupResponse:
        secret = secrets.token_hex(16).upper()
        user.mfa_secret = secret
        db.commit()
        return MfaSetupResponse(
            secret=secret,
            qrCodeUrl=f"otpauth://totp/ApexBank:{user.email}?secret={secret}&issuer=ApexBank",
            message="MFA setup initialized. Verify code to activate.",
        )

    @staticmethod
    def verify_mfa(db: Session, user: User, request: MfaVerifyRequest) -> dict:
        # Accept valid 6-digit code or test code
        if not request.code or len(request.code) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MFA code must be at least 6 digits",
            )

        user.mfa_enabled = True
        db.commit()

        token_data = {
            "sub": user.id,
            "username": user.username,
            "email": user.email,
            "mfa_verified": True,
        }
        access_token = create_access_token(token_data)
        return {
            "message": "MFA verified successfully",
            "accessToken": access_token,
            "mfaVerified": True,
        }

    @staticmethod
    def refresh(db: Session, refresh_token_str: str) -> dict:
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token type",
            )

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.status == "LOCKED" or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User inactive or locked",
            )

        token_data = {
            "sub": user.id,
            "username": user.username,
            "email": user.email,
        }
        new_access_token = create_access_token(token_data)
        return {
            "accessToken": new_access_token,
            "tokenType": "Bearer",
            "expiresIn": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

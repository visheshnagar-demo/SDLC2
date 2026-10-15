from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import User
from server.schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    MfaVerifyRequest,
    MfaSetupResponse,
    AuthResponse,
    AuthUserDto,
    MessageResponse,
)
from server.security import get_current_user
from server.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=AuthUserDto, status_code=status.HTTP_201_CREATED
)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = AuthService.register(db, request)
    return AuthUserDto(
        userId=user.id,
        username=user.username,
        email=user.email,
        fullName=user.full_name,
        status=user.status,
        mfaEnabled=user.mfa_enabled,
    )


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    client_ip = req.client.host if req.client else None
    user_agent = req.headers.get("user-agent")
    return AuthService.login(db, request, ip_address=client_ip, user_agent=user_agent)


@router.post("/logout", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def logout():
    return MessageResponse(message="Logged out successfully")


@router.post("/refresh", status_code=status.HTTP_200_OK)
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    return AuthService.refresh(db, request.refresh_token)


@router.post(
    "/mfa/setup", response_model=MfaSetupResponse, status_code=status.HTTP_200_OK
)
def setup_mfa(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return AuthService.setup_mfa(db, current_user)


@router.post("/mfa/verify", status_code=status.HTTP_200_OK)
def verify_mfa(
    request: MfaVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AuthService.verify_mfa(db, current_user, request)

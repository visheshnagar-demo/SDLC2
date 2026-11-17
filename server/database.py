import bcrypt
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError
from server.config import settings

# Engine configuration
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    # Truncate to 72 bytes to prevent bcrypt ValueError
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


_SEED_USERS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "test@example.com",
        "password": "testpassword",
        "full_name": "Standard Carrier User",
        "company_name": "Apex Mutual Insurance",
        "role": "carrier",
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "email": "admin@example.com",
        "password": "adminpassword",
        "full_name": "System Administrator",
        "company_name": "Global Re Underwriters",
        "role": "admin",
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "email": "underwriter@example.com",
        "password": "underwriterpassword",
        "full_name": "Senior Underwriter",
        "company_name": "Global Re Underwriters",
        "role": "underwriter",
    },
]


def init_db() -> None:
    # Ensure all models are imported so Base.metadata knows about them
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session) -> None:
    from server.models.user import User

    for u in _SEED_USERS:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if existing:
            continue
        user = User(
            id=u["id"],
            email=u["email"],
            hashed_password=hash_password(u["password"]),
            full_name=u["full_name"],
            company_name=u["company_name"],
            role=u["role"],
            is_active=True,
            is_verified=True,
            email_verified=True,
            disabled=False,
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()

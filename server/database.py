from typing import Generator
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from server.config import DATABASE_URL

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def seed_data(db: Session) -> None:
    from server.models.user import User

    seed_users = [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Test Carrier User",
            "company_name": "Acme Mutual Insurance",
            "role": "carrier",
        },
        {
            "id": "22222222-2222-2222-2222-222222222222",
            "email": "carrier@example.com",
            "password": "testpassword",
            "full_name": "Primary Carrier Rep",
            "company_name": "Global Shield Underwriting",
            "role": "carrier",
        },
        {
            "id": "33333333-3333-3333-3333-333333333333",
            "email": "admin@example.com",
            "password": "adminpassword",
            "full_name": "System Administrator",
            "company_name": "Global Reinsurance Portal",
            "role": "admin",
        },
        {
            "id": "44444444-4444-4444-4444-444444444444",
            "email": "underwriter@example.com",
            "password": "testpassword",
            "full_name": "Senior Risk Underwriter",
            "company_name": "Apex Facultative Reinsurance",
            "role": "underwriter",
        },
    ]

    for u_data in seed_users:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            user = User(
                id=u_data["id"],
                email=u_data["email"],
                full_name=u_data["full_name"],
                company_name=u_data["company_name"],
                role=u_data["role"],
                hashed_password=hash_password(u_data["password"]),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
    try:
        db.commit()
    except Exception:
        db.rollback()


def init_db() -> None:
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_data(db)

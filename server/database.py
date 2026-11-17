import os
import uuid
import hashlib
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from server.config import DATABASE_URL

if DATABASE_URL.startswith("sqlite") and ":memory:" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
elif DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _hash_password_internal(password: str) -> str:
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8")[:72],
        salt.encode("utf-8"),
        100000,
    ).hex()
    return f"{salt}${pwd_hash}"


def init_db():
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models.user import User

    seed_users = [
        {
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Test Customer",
            "role": "customer",
        },
        {
            "email": "officer@example.com",
            "password": "officerpassword",
            "full_name": "Compliance Officer Jane",
            "role": "compliance_officer",
        },
        {
            "email": "admin@example.com",
            "password": "adminpassword",
            "full_name": "System Administrator",
            "role": "admin",
        },
    ]

    for item in seed_users:
        existing = db.query(User).filter(User.email == item["email"]).first()
        if not existing:
            hashed = _hash_password_internal(item["password"])
            user = User(
                id=str(uuid.uuid4()),
                email=item["email"],
                hashed_password=hashed,
                full_name=item["full_name"],
                role=item["role"],
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            try:
                db.add(user)
                db.commit()
            except Exception:
                db.rollback()

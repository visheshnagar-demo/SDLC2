import os
import uuid
import hashlib
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./facultative_reinsurance.db")

# For SQLite, handle same thread connection argument
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    """Deterministic secure hash for passwords."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


def init_db():
    """Create all database tables."""
    from server import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    """Seed initial users and system reference data idempotently."""
    from server.models import User

    # Ensure tables exist
    init_db()

    # Seed Carrier User
    carrier_email = "test@example.com"
    carrier_user = db.query(User).filter(User.email == carrier_email).first()
    if not carrier_user:
        carrier_user = User(
            id=str(uuid.uuid4()),
            email=carrier_email,
            hashed_password=hash_password("testpassword"),
            full_name="Carrier Test Representative",
            organization_name="Global Mutual Insurance",
            role="CARRIER_REP",
            is_active=True,
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(carrier_user)

    # Seed Underwriter / Admin User
    admin_email = "admin@example.com"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        admin_user = User(
            id=str(uuid.uuid4()),
            email=admin_email,
            hashed_password=hash_password("adminpassword"),
            full_name="Senior Reinsurance Underwriter",
            organization_name="Apex Reinsurance Group",
            role="UNDERWRITER",
            is_active=True,
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(admin_user)

    try:
        db.commit()
    except Exception:
        db.rollback()

import os
import uuid
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./reinsurance_portal.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

if DATABASE_URL.startswith("sqlite:///:memory:"):
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        poolclass=StaticPool,
    )
else:
    engine = create_engine(
        DATABASE_URL,
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


def init_db(target_engine=None) -> None:
    eng = target_engine or engine
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=eng)


def seed_data(db: Session) -> None:
    from server.models import UnderwritingAuthority

    # Seed default authorities if not present
    existing_uw = (
        db.query(UnderwritingAuthority).filter_by(role_name="UNDERWRITER").first()
    )
    if not existing_uw:
        uw_auth = UnderwritingAuthority(
            id=str(uuid.uuid4()), role_name="UNDERWRITER", max_policy_limit=5000000.00
        )
        db.add(uw_auth)

    existing_mgr = (
        db.query(UnderwritingAuthority).filter_by(role_name="MANAGER").first()
    )
    if not existing_mgr:
        mgr_auth = UnderwritingAuthority(
            id=str(uuid.uuid4()), role_name="MANAGER", max_policy_limit=25000000.00
        )
        db.add(mgr_auth)

    try:
        db.commit()
    except Exception:
        db.rollback()

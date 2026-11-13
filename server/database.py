import os
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/qtb.db")

# For SQLite, ensure check_same_thread is False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables idempotently."""
    import server.models  # ensure models are imported # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session | None = None) -> None:
    """Seed initial demo scenarios and fixtures."""
    from server.services.fixtures import seed_initial_scenarios

    if db is None:
        db = SessionLocal()
        try:
            seed_initial_scenarios(db)
        finally:
            db.close()
    else:
        seed_initial_scenarios(db)

import os
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/qtb.db")

# For SQLite, ensure check_same_thread is False
connect_args = (
    {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db(target_engine=None) -> None:
    """Initialize database tables idempotently."""
    import server.models  # ensure models are imported # noqa: F401

    bind_engine = target_engine or engine
    Base.metadata.create_all(bind=bind_engine)


def seed_data(db: Session | None = None) -> None:
    """Seed initial demo scenarios and fixtures."""
    from server.services.fixtures import seed_initial_scenarios

    if db is None:
        session = SessionLocal()
        try:
            seed_initial_scenarios(session)
        finally:
            session.close()
    else:
        seed_initial_scenarios(db)


def get_db() -> Generator[Session, None, None]:
    init_db()
    db = SessionLocal()
    try:
        import server.models

        if not db.query(server.models.Case).first():
            seed_data(db)
    except Exception:
        pass
    try:
        yield db
    finally:
        db.close()


# Auto-initialize DB on module import
init_db()

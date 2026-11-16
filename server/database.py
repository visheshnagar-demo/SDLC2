import os
import tempfile
from pathlib import Path
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool

raw_db_url = os.getenv("DATABASE_URL")
if not raw_db_url:
    if os.name == "nt":
        temp_dir = Path(tempfile.gettempdir())
        db_file = temp_dir / "qtb.db"
        DATABASE_URL = f"sqlite:///{db_file.as_posix()}"
    else:
        try:
            Path("/tmp").mkdir(parents=True, exist_ok=True)
        except Exception:
            pass
        DATABASE_URL = "sqlite:////tmp/qtb.db"
elif raw_db_url.startswith("sqlite:////tmp/") and os.name == "nt":
    rel = raw_db_url[len("sqlite:////tmp/") :]
    temp_dir = Path(tempfile.gettempdir())
    db_file = temp_dir / rel
    DATABASE_URL = f"sqlite:///{db_file.as_posix()}"
else:
    DATABASE_URL = raw_db_url

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}
engine_kwargs = {"connect_args": connect_args}
if is_sqlite and (":memory:" in DATABASE_URL or os.getenv("TESTING") == "true"):
    engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **engine_kwargs)
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
        try:
            init_db()
            seed_data(db)
        except Exception:
            pass
    try:
        yield db
    finally:
        db.close()


# Auto-initialize DB on module import
init_db()

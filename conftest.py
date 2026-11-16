import pytest
from collections.abc import Generator
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

import server.models  # ensure models are registered on Base # noqa: F401
from server.database import engine, SessionLocal, get_db, init_db, seed_data
from server.main import app


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    init_db(engine)
    db = SessionLocal()
    seed_data(db)
    db.close()
    yield


def _override_get_db() -> Generator[Session, None, None]:
    init_db(engine)
    db = SessionLocal()
    try:
        if not db.query(server.models.Case).first():
            seed_data(db)
    except Exception:
        db.rollback()
        init_db(engine)
        seed_data(db)
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    init_db(engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c

import os

os.environ["TESTING"] = "true"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from server.database import Base, get_db, seed_data
from server.main import app
from server.services.auth_service import create_access_token

# Shared in-memory test database with StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def underwriter_headers():
    token = create_access_token(
        data={
            "sub": "underwriter@example.com",
            "role": "RE_UNDERWRITER",
            "org_id": "RE-001",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def manager_headers():
    token = create_access_token(
        data={
            "sub": "admin@example.com",
            "role": "UNDERWRITING_MANAGER",
            "org_id": "RE-001",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def ceding_headers():
    token = create_access_token(
        data={
            "sub": "ceding@example.com",
            "role": "CEDING_UNDERWRITER",
            "org_id": "HGIC-770",
        }
    )
    return {"Authorization": f"Bearer {token}"}

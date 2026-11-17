import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import server.models  # noqa: F401
from server.database import Base, get_db, seed_data
from server.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def _create_schema_once():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(autouse=True)
def _clean_tables():
    """Function-scoped: wipe DATA between tests and re-seed users so state doesn't leak."""
    with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
    db = TestingSessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def carrier_token(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def underwriter_token(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "underwriter@example.com", "password": "underwriterpassword"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]

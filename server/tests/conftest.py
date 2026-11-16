import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from starlette.testclient import TestClient

import server.models  # noqa: F401
from server.database import Base, get_db, seed_data
from server.main import app
from server.routers.auth_router import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    seed_data(session)
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
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
def carrier_headers():
    token = create_access_token(
        {
            "sub": "test@example.com",
            "role": "carrier",
            "user_id": "11111111-1111-1111-1111-111111111111",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def underwriter_headers():
    token = create_access_token(
        {
            "sub": "underwriter@example.com",
            "role": "underwriter",
            "user_id": "44444444-4444-4444-4444-444444444444",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    token = create_access_token(
        {
            "sub": "admin@example.com",
            "role": "admin",
            "user_id": "33333333-3333-3333-3333-333333333333",
        }
    )
    return {"Authorization": f"Bearer {token}"}

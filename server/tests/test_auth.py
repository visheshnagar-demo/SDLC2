def test_register_success(client):
    payload = {
        "username": "newuser123",
        "email": "newuser123@example.com",
        "password": "SecurePassword123!",
        "fullName": "New User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser123"
    assert data["email"] == "newuser123@example.com"
    assert data["status"] == "ACTIVE"


def test_register_duplicate_email(client):
    payload = {
        "username": "uniqueuser",
        "email": "test@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_register_duplicate_username(client):
    payload = {
        "username": "testuser",
        "email": "different@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already taken" in response.json()["detail"]


def test_login_success(client):
    payload = {
        "username": "testuser",
        "password": "testpassword",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert data["tokenType"] == "Bearer"
    assert data["expiresIn"] == 900
    assert data["user"]["username"] == "testuser"
    assert data["user"]["email"] == "test@example.com"


def test_login_invalid_credentials(client):
    payload = {
        "username": "testuser",
        "password": "wrongpassword",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]


def test_account_lockout_after_5_failed_attempts(client):
    # Register a dedicated user for lockout testing
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "lockoutuser",
            "email": "lockout@example.com",
            "password": "CorrectPassword123!",
        },
    )

    # Attempt 1 to 4 with bad password
    for _ in range(4):
        resp = client.post(
            "/api/v1/auth/login",
            json={"username": "lockoutuser", "password": "badpassword"},
        )
        assert resp.status_code == 401

    # Attempt 5 triggers lockout
    resp5 = client.post(
        "/api/v1/auth/login",
        json={"username": "lockoutuser", "password": "badpassword"},
    )
    assert resp5.status_code in (401, 423)

    # Next attempt (even with correct password) must be locked
    resp_correct = client.post(
        "/api/v1/auth/login",
        json={"username": "lockoutuser", "password": "CorrectPassword123!"},
    )
    assert resp_correct.status_code == 423
    assert "locked" in resp_correct.json()["detail"].lower()


def test_logout(client):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert "Logged out successfully" in response.json()["message"]


def test_refresh_token(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "testpassword"},
    )
    refresh_token = login_resp.json()["refreshToken"]

    response = client.post(
        "/api/v1/auth/refresh",
        json={"refreshToken": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert data["tokenType"] == "Bearer"


def test_mfa_setup_and_verification(client, auth_headers):
    # Setup MFA
    setup_resp = client.post("/api/v1/auth/mfa/setup", headers=auth_headers)
    assert setup_resp.status_code == 200
    setup_data = setup_resp.json()
    assert "secret" in setup_data
    assert "qrCodeUrl" in setup_data

    # Verify MFA with valid 6-digit code
    verify_resp = client.post(
        "/api/v1/auth/mfa/verify",
        json={"code": "123456"},
        headers=auth_headers,
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["mfaVerified"] is True
    assert "accessToken" in verify_resp.json()

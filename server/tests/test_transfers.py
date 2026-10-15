import uuid


def test_transfer_unauthenticated(client):
    payload = {
        "sourceAccountId": str(uuid.uuid4()),
        "destinationAccountNumber": "ACC-3003",
        "amount": 100.0,
    }
    response = client.post("/api/v1/transfers", json=payload)
    assert response.status_code == 401


def test_transfer_success(client, auth_headers):
    # Get user accounts
    accounts_resp = client.get("/api/v1/accounts", headers=auth_headers)
    checking_acc = next(
        acc for acc in accounts_resp.json() if acc["type"] == "CHECKING"
    )
    source_id = checking_acc["accountId"]
    initial_balance = checking_acc["balance"]

    transfer_amount = 250.00
    payload = {
        "sourceAccountId": source_id,
        "destinationAccountNumber": "ACC-3003",
        "amount": transfer_amount,
        "currency": "USD",
        "description": "Rent payment",
        "idempotencyKey": str(uuid.uuid4()),
    }

    response = client.post("/api/v1/transfers", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "transferId" in data
    assert data["status"] == "COMPLETED"
    assert data["amount"] == 250.00
    assert data["sourceBalanceAfter"] == initial_balance - transfer_amount
    assert data["referenceNumber"].startswith("TRX-")

    # Verify updated balance on account endpoint
    updated_acc = client.get(
        f"/api/v1/accounts/{source_id}", headers=auth_headers
    ).json()
    assert updated_acc["balance"] == initial_balance - transfer_amount

    # Verify transaction ledger has recorded the debit
    tx_resp = client.get(
        f"/api/v1/accounts/{source_id}/transactions", headers=auth_headers
    )
    tx_data = tx_resp.json()
    latest_tx = tx_data["content"][0]
    assert latest_tx["type"] == "DEBIT"
    assert latest_tx["amount"] == 250.00


def test_transfer_insufficient_funds(client, auth_headers):
    accounts_resp = client.get("/api/v1/accounts", headers=auth_headers)
    checking_acc = next(
        acc for acc in accounts_resp.json() if acc["type"] == "CHECKING"
    )
    source_id = checking_acc["accountId"]

    payload = {
        "sourceAccountId": source_id,
        "destinationAccountNumber": "ACC-3003",
        "amount": 999999.00,
    }

    response = client.post("/api/v1/transfers", json=payload, headers=auth_headers)
    assert response.status_code in (400, 422)
    assert "insufficient funds" in response.json()["detail"].lower()


def test_transfer_negative_or_zero_amount(client, auth_headers):
    accounts_resp = client.get("/api/v1/accounts", headers=auth_headers)
    source_id = accounts_resp.json()[0]["accountId"]

    # Test 0 amount
    resp_zero = client.post(
        "/api/v1/transfers",
        json={
            "sourceAccountId": source_id,
            "destinationAccountNumber": "ACC-3003",
            "amount": 0.0,
        },
        headers=auth_headers,
    )
    assert resp_zero.status_code == 400
    assert "greater than zero" in resp_zero.json()["detail"]

    # Test negative amount
    resp_neg = client.post(
        "/api/v1/transfers",
        json={
            "sourceAccountId": source_id,
            "destinationAccountNumber": "ACC-3003",
            "amount": -50.0,
        },
        headers=auth_headers,
    )
    assert resp_neg.status_code == 400


def test_transfer_invalid_destination(client, auth_headers):
    accounts_resp = client.get("/api/v1/accounts", headers=auth_headers)
    source_id = accounts_resp.json()[0]["accountId"]

    payload = {
        "sourceAccountId": source_id,
        "destinationAccountNumber": "NON-EXISTENT-ACC",
        "amount": 10.0,
    }
    response = client.post("/api/v1/transfers", json=payload, headers=auth_headers)
    assert response.status_code == 404
    assert "destination account not found" in response.json()["detail"].lower()


def test_transfer_same_account_rejected(client, auth_headers):
    accounts_resp = client.get("/api/v1/accounts", headers=auth_headers)
    source_acc = accounts_resp.json()[0]

    payload = {
        "sourceAccountId": source_acc["accountId"],
        "destinationAccountNumber": source_acc["accountNumber"],
        "amount": 10.0,
    }
    response = client.post("/api/v1/transfers", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "same account" in response.json()["detail"].lower()


def test_transfer_idempotency(client, auth_headers):
    accounts_resp = client.get("/api/v1/accounts", headers=auth_headers)
    source_id = accounts_resp.json()[0]["accountId"]
    initial_balance = accounts_resp.json()[0]["balance"]

    idempotency_key = f"idempotent-{uuid.uuid4()}"
    payload = {
        "sourceAccountId": source_id,
        "destinationAccountNumber": "ACC-3003",
        "amount": 50.00,
        "idempotencyKey": idempotency_key,
    }

    # First request
    resp1 = client.post("/api/v1/transfers", json=payload, headers=auth_headers)
    assert resp1.status_code == 201
    transfer_id = resp1.json()["transferId"]
    ref1 = resp1.json()["referenceNumber"]

    # Second request with identical idempotencyKey
    resp2 = client.post("/api/v1/transfers", json=payload, headers=auth_headers)
    assert resp2.status_code in (200, 201)
    assert resp2.json()["transferId"] == transfer_id
    assert resp2.json()["referenceNumber"] == ref1

    # Verify balance was only deducted once
    updated_acc = client.get(
        f"/api/v1/accounts/{source_id}", headers=auth_headers
    ).json()
    assert updated_acc["balance"] == initial_balance - 50.00


def test_get_transfer_by_id(client, auth_headers):
    accounts_resp = client.get("/api/v1/accounts", headers=auth_headers)
    source_id = accounts_resp.json()[0]["accountId"]

    payload = {
        "sourceAccountId": source_id,
        "destinationAccountNumber": "ACC-3003",
        "amount": 20.00,
    }
    transfer_resp = client.post("/api/v1/transfers", json=payload, headers=auth_headers)
    transfer_id = transfer_resp.json()["transferId"]

    response = client.get(f"/api/v1/transfers/{transfer_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["transferId"] == transfer_id
    assert data["status"] == "COMPLETED"
    assert data["amount"] == 20.00

def test_get_accounts_unauthenticated(client):
    response = client.get("/api/v1/accounts")
    assert response.status_code == 401


def test_get_accounts_success(client, auth_headers):
    response = client.get("/api/v1/accounts", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

    account_types = [acc["type"] for acc in data]
    assert "CHECKING" in account_types
    assert "SAVINGS" in account_types

    checking = next(acc for acc in data if acc["type"] == "CHECKING")
    assert checking["balance"] == 5000.00
    assert checking["accountNumber"] == "ACC-1001"
    assert checking["currency"] == "USD"
    assert checking["status"] == "ACTIVE"


def test_get_account_by_id_success(client, auth_headers):
    list_resp = client.get("/api/v1/accounts", headers=auth_headers)
    account_id = list_resp.json()[0]["accountId"]

    response = client.get(f"/api/v1/accounts/{account_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["accountId"] == account_id
    assert "balance" in data
    assert "accountNumber" in data


def test_get_account_by_id_not_found(client, auth_headers):
    response = client.get("/api/v1/accounts/non-existent-uuid", headers=auth_headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_account_transactions_success(client, auth_headers):
    list_resp = client.get("/api/v1/accounts", headers=auth_headers)
    checking_acc = next(acc for acc in list_resp.json() if acc["type"] == "CHECKING")
    account_id = checking_acc["accountId"]

    response = client.get(
        f"/api/v1/accounts/{account_id}/transactions", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "totalElements" in data
    assert "totalPages" in data
    assert isinstance(data["content"], list)
    assert data["totalElements"] >= 1
    assert data["content"][0]["type"] in ("DEBIT", "CREDIT")


def test_get_account_transactions_pagination(client, auth_headers):
    list_resp = client.get("/api/v1/accounts", headers=auth_headers)
    account_id = list_resp.json()[0]["accountId"]

    response = client.get(
        f"/api/v1/accounts/{account_id}/transactions?page=0&size=1&sort=desc",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["content"]) <= 1
    assert data["size"] == 1
    assert data["page"] == 0

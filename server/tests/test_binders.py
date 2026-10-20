def test_get_all_binders(client):
    response = client.get("/api/v1/binders")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_binder_by_id(client):
    binder_id = "e8f9a0b1-c2d3-4e5f-6a7b-8c9d0e1f2a3b"
    response = client.get(f"/api/v1/binders/{binder_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == binder_id
    assert data["policyReferenceId"] == "GENRE-QTB-2026-88412"
    assert data["status"] == "BOUND"
    assert "binderTitle" in data["documentSummary"]


def test_create_binder_success(client):
    quote_id = "a1b2c3d4-e5f6-7890-abcd-1234567890ab"
    payload = {
        "quoteId": quote_id,
        "effectiveDate": "2026-07-01",
        "expiryDate": "2027-07-01",
        "boundBy": "UW-4091",
    }
    response = client.post("/api/v1/binders", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["quoteId"] == quote_id
    assert data["status"] == "BOUND"
    assert "GENRE-QTB-2026-" in data["policyReferenceId"]
    assert data["effectiveDate"] == "2026-07-01"
    assert data["grossPremium"] == 1850000.0

    # Verify quote status is updated to BOUND
    q_resp = client.get(f"/api/v1/quotes/{quote_id}")
    assert q_resp.status_code == 200
    assert q_resp.json()["status"] == "BOUND"


def test_create_binder_quote_not_found(client):
    payload = {
        "quoteId": "00000000-0000-0000-0000-000000000000",
        "effectiveDate": "2026-07-01",
        "expiryDate": "2027-07-01",
        "boundBy": "UW-4091",
    }
    response = client.post("/api/v1/binders", json=payload)
    assert response.status_code == 404

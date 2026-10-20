def test_get_quotes_paginated(client):
    response = client.get("/api/v1/quotes?page=0&size=10")
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "totalElements" in data
    assert data["totalElements"] >= 4
    assert len(data["content"]) >= 4


def test_get_quotes_filtered_by_status(client):
    response = client.get("/api/v1/quotes?status=APPROVED")
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    for q in data["content"]:
        assert q["status"] == "APPROVED"


def test_get_quote_by_id(client):
    quote_id = "a1b2c3d4-e5f6-7890-abcd-1234567890ab"
    response = client.get(f"/api/v1/quotes/{quote_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == quote_id
    assert data["quoteNumber"] == "QTB-2026-00101"
    assert data["insuredName"] == "Apex Energy Global Corp"
    assert len(data["layers"]) > 0


def test_get_quote_not_found(client):
    response = client.get("/api/v1/quotes/non-existent-uuid")
    assert response.status_code == 404


def test_create_quote_success(client):
    payload = {
        "insuredName": "Oceanic Marine Transport",
        "lineOfBusiness": "Marine & Energy",
        "sumInsured": 30000000.0,
        "deductible": 1500000.0,
        "structureType": "EXCESS_OF_LOSS",
        "attachmentPoint": 5000000.0,
        "targetRate": 3.8,
        "cedingCommission": 15.0,
    }
    response = client.post("/api/v1/quotes", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insuredName"] == "Oceanic Marine Transport"
    assert data["status"] == "QUOTED"
    assert data["quotedPremium"] == 1140000.0
    assert len(data["layers"]) == 2
    assert data["layers"][0]["genreSharePercentage"] == 100.0

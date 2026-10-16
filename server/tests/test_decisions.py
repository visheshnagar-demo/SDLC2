from fastapi.testclient import TestClient


def test_quote_decision_flow(client: TestClient):
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]
    sub_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "CYBER",
            "insured_name": "Quantum Secure Tech",
            "limit_requested": 5000000.0,
            "attachment_point": 2500000.0,
            "retention": 500000.0,
            "effective_date": "2026-05-01",
            "expiry_date": "2027-05-01",
        },
    )
    sub_id = sub_resp.json()["id"]

    # Submit Quote
    quote_payload = {
        "submission_id": sub_id,
        "premium_amount": 145000.0,
        "capacity_offered": 5000000.0,
        "deductible_retention": 500000.0,
        "subjectivities": "Subject to receipt of clean SOC2 report within 14 days of binding.",
        "validity_period_days": 30,
        "underwriter_id": "UW-CYBER-LEAD",
        "notes": "Approved at standard tech cyber rate.",
    }

    resp = client.post("/api/v1/decisions/quote", json=quote_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision_type"] == "QUOTE"
    assert data["premium_amount"] == 145000.0
    assert data["capacity_offered"] == 5000000.0
    assert data["submission_id"] == sub_id

    # Verify submission status transitioned to QUOTED
    sub_get = client.get(f"/api/v1/submissions/{sub_id}").json()
    assert sub_get["status"] == "QUOTED"
    assert sub_get["decision"]["decision_type"] == "QUOTE"

    # Get decision by submission endpoint
    dec_get = client.get(f"/api/v1/decisions/{sub_id}")
    assert dec_get.status_code == 200
    assert dec_get.json()["premium_amount"] == 145000.0


def test_decline_decision_flow(client: TestClient):
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]
    sub_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "D_AND_O",
            "insured_name": "HighRisk Ventures Group",
            "limit_requested": 25000000.0,
            "attachment_point": 5000000.0,
            "retention": 1000000.0,
            "effective_date": "2026-06-01",
            "expiry_date": "2027-06-01",
            "prior_loss_count": 4,
            "prior_loss_total": 8000000.0,
        },
    )
    sub_id = sub_resp.json()["id"]

    # Submit Decline
    decline_payload = {
        "submission_id": sub_id,
        "decline_reason_code": "EXCESSIVE_LOSS_HISTORY",
        "underwriter_id": "UW-EXEC-DIR",
        "notes": "4 prior claims exceeding $8M in losses outside underwriting appetite.",
    }

    resp = client.post("/api/v1/decisions/decline", json=decline_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision_type"] == "DECLINE"
    assert data["decline_reason_code"] == "EXCESSIVE_LOSS_HISTORY"

    # Verify submission status transitioned to DECLINED
    sub_get = client.get(f"/api/v1/submissions/{sub_id}").json()
    assert sub_get["status"] == "DECLINED"


def test_decision_validation_errors(client: TestClient):
    # Invalid submission ID
    resp = client.post(
        "/api/v1/decisions/quote",
        json={
            "submission_id": "invalid-uuid",
            "premium_amount": 10000.0,
            "capacity_offered": 1000000.0,
            "deductible_retention": 100000.0,
        },
    )
    assert resp.status_code == 404

    # Negative premium
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]
    sub_id = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "CYBER",
            "insured_name": "Test Valid Sub",
            "limit_requested": 1000000.0,
            "attachment_point": 500000.0,
            "retention": 100000.0,
            "effective_date": "2026-01-01",
            "expiry_date": "2027-01-01",
        },
    ).json()["id"]

    resp2 = client.post(
        "/api/v1/decisions/quote",
        json={
            "submission_id": sub_id,
            "premium_amount": -500.0,
            "capacity_offered": 1000000.0,
            "deductible_retention": 100000.0,
        },
    )
    assert resp2.status_code == 422

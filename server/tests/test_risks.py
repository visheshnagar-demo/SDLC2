def test_get_all_risks(client):
    response = client.get("/api/v1/risks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4


def test_get_risk_by_id(client):
    risk_id = "f1a2b3c4-d5e6-7890-abcd-111122223333"
    response = client.get(f"/api/v1/risks/{risk_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == risk_id
    assert data["underwritingDecision"] == "APPROVED"
    assert data["catRiskScore"] == 42
    assert len(data["layers"]) == 3


def test_update_underwriting_decision_approved(client):
    risk_id = "f2b3c4d5-e6f7-8901-bcde-222233334444"
    payload = {
        "decision": "APPROVED",
        "underwriterId": "UW-4091",
        "reviewNotes": "All aggregate exposure metrics cleared. Approved.",
    }
    response = client.patch(f"/api/v1/risks/{risk_id}/decision", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["underwritingDecision"] == "APPROVED"
    assert "cleared" in data["underwriterNotes"]

    # Verify corresponding quote is now APPROVED
    quote_id = data["quoteId"]
    q_resp = client.get(f"/api/v1/quotes/{quote_id}")
    assert q_resp.status_code == 200
    assert q_resp.json()["status"] == "APPROVED"


def test_update_underwriting_decision_declined(client):
    risk_id = "f3c4d5e6-f7a8-9012-cdef-333344445555"
    payload = {
        "decision": "DECLINED",
        "underwriterId": "UW-4091",
        "reviewNotes": "Exposure exceeds acceptable cyber risk threshold.",
    }
    response = client.patch(f"/api/v1/risks/{risk_id}/decision", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["underwritingDecision"] == "DECLINED"

    # Verify corresponding quote is now DECLINED
    quote_id = data["quoteId"]
    q_resp = client.get(f"/api/v1/quotes/{quote_id}")
    assert q_resp.status_code == 200
    assert q_resp.json()["status"] == "DECLINED"

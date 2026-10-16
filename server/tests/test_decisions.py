def test_record_quote_decision(client):
    # Create submission
    sub_payload = {
        "risk_type": "CYBER",
        "insured_name": "Gamma Financial Systems",
        "industry_sector": "Financial Services",
        "annual_revenue": 120000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 5000000.0,
        "policy_effective_date": "2026-11-01",
        "policy_expiration_date": "2027-11-01",
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Record Quote decision
    quote_payload = {
        "decision_type": "QUOTE",
        "quoted_capacity": 5000000.0,
        "premium_rate_pct": 0.0275,
        "quoted_premium": 137500.0,
        "quote_validity_days": 30,
        "underwriter_notes": "Accepted at $5M capacity attached at $5M primary. Subject to verification of clean 3-year loss runs.",
    }
    dec_res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions", json=quote_payload
    )
    assert dec_res.status_code == 201
    dec_data = dec_res.json()
    assert dec_data["decision_type"] == "QUOTE"
    assert dec_data["quoted_capacity"] == 5000000.0
    assert dec_data["quoted_premium"] == 137500.0
    assert dec_data["quote_validity_days"] == 30

    # Verify submission status updated to QUOTED
    get_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_res.status_code == 200
    sub_detail = get_res.json()
    assert sub_detail["status"] == "QUOTED"
    assert sub_detail["decision"] is not None
    assert sub_detail["decision"]["decision_type"] == "QUOTE"

    # Verify audit log recorded
    audit_res = client.get(f"/api/v1/underwriting/submissions/{sub_id}/audit")
    assert audit_res.status_code == 200
    actions = [log["action"] for log in audit_res.json()]
    assert "DECISION_QUOTE" in actions


def test_record_decline_decision(client):
    # Create submission
    sub_payload = {
        "risk_type": "D_AND_O",
        "insured_name": "Omega High Risk Ventures",
        "industry_sector": "Cryptocurrency",
        "annual_revenue": 20000000.0,
        "primary_policy_limit": 5000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 0.0,
        "policy_effective_date": "2026-12-01",
        "policy_expiration_date": "2027-12-01",
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Record Decline decision
    decline_payload = {
        "decision_type": "DECLINE",
        "decline_reason_code": "HIGH_LOSS_RATIO",
        "underwriter_notes": "Declined due to volatile industry sector and zero attachment buffer on primary retention.",
    }
    dec_res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions", json=decline_payload
    )
    assert dec_res.status_code == 201
    dec_data = dec_res.json()
    assert dec_data["decision_type"] == "DECLINE"
    assert dec_data["decline_reason_code"] == "HIGH_LOSS_RATIO"

    # Verify submission status updated to DECLINED
    get_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "DECLINED"


def test_decision_validation_errors(client):
    sub_payload = {
        "risk_type": "CYBER",
        "insured_name": "Sigma Analytics",
        "industry_sector": "Technology",
        "annual_revenue": 10000000.0,
        "primary_policy_limit": 2000000.0,
        "requested_reinsurance_limit": 1000000.0,
        "attachment_point": 1000000.0,
        "policy_effective_date": "2027-01-01",
        "policy_expiration_date": "2028-01-01",
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Invalid decision type
    invalid_type_payload = {
        "decision_type": "INVALID_TYPE",
    }
    res1 = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=invalid_type_payload,
    )
    assert res1.status_code == 422

    # Negative quoted capacity
    invalid_cap_payload = {
        "decision_type": "QUOTE",
        "quoted_capacity": -50000.0,
    }
    res2 = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions", json=invalid_cap_payload
    )
    assert res2.status_code == 422

    # Non existent submission
    res3 = client.post(
        "/api/v1/underwriting/submissions/non-existent/decisions",
        json={"decision_type": "DECLINE"},
    )
    assert res3.status_code == 404

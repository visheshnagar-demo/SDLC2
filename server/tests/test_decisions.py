def test_record_quote_decision(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "SecureBank National",
        "industry_sector": "Financial Services",
        "annual_revenue": 200000000.0,
        "primary_policy_limit": 50000000.0,
        "requested_reinsurance_limit": 20000000.0,
        "attachment_point": 30000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    created = client.post("/api/v1/submissions", json=payload).json()
    sub_id = created["id"]

    decision_payload = {
        "decision_type": "QUOTE",
        "quoted_capacity": 15000000.0,
        "premium_rate_pct": 3.75,
        "quoted_premium": 562500.0,
        "quote_validity_days": 30,
        "underwriter_notes": "Approved 75% requested capacity at 3.75% rate based on favorable security framework.",
        "decided_by": "lead_underwriter@reinsurance.com",
    }
    res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions", json=decision_payload
    )
    assert res.status_code == 201
    decision = res.json()
    assert decision["decision_type"] == "QUOTE"
    assert decision["quoted_capacity"] == 15000000.0
    assert decision["quoted_premium"] == 562500.0

    # Verify submission status updated to QUOTED
    sub_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert sub_res.status_code == 200
    assert sub_res.json()["status"] == "QUOTED"


def test_record_decision_singular_endpoint(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Singular Decision Corp",
        "primary_policy_limit": 10000000.0,
        "attachment_point": 2000000.0,
    }
    created = client.post("/api/v1/submissions", json=payload).json()
    sub_id = created["id"]

    decision_payload = {
        "decision": "QUOTE",
        "capacity": 8000000.0,
        "rate": 3.5,
        "premium": 280000.0,
        "notes": "Approved via singular decision endpoint",
    }
    res = client.post(
        f"/api/v1/submissions/{sub_id}/decision", json=decision_payload
    )
    assert res.status_code == 201
    data = res.json()
    assert data["decision_type"] == "QUOTE"
    assert data["quoted_capacity"] == 8000000.0

    uw_res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decision", json=decision_payload
    )
    assert uw_res.status_code == 201


def test_record_decline_decision(client):
    payload = {
        "risk_type": "D_AND_O",
        "insured_name": "HighRisk Ventures Inc",
        "industry_sector": "Cryptocurrency",
        "annual_revenue": 10000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 8000000.0,
        "attachment_point": 2000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    created = client.post("/api/v1/submissions", json=payload).json()
    sub_id = created["id"]

    decline_payload = {
        "decision_type": "DECLINE",
        "decline_reason_code": "HIGH_EXPOSURE_AGGREGATION",
        "underwriter_notes": "Declined due to low attachment point and crypto sector exposure aggregation.",
        "decided_by": "senior_underwriter@reinsurance.com",
    }
    res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions", json=decline_payload
    )
    assert res.status_code == 201
    decision = res.json()
    assert decision["decision_type"] == "DECLINE"
    assert decision["decline_reason_code"] == "HIGH_EXPOSURE_AGGREGATION"

    # Verify submission status updated to DECLINED
    sub_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert sub_res.status_code == 200
    assert sub_res.json()["status"] == "DECLINED"


def test_invalid_decision_type_fails_422(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Test Company",
        "industry_sector": "Technology",
        "annual_revenue": 10000000.0,
        "primary_policy_limit": 5000000.0,
        "requested_reinsurance_limit": 2000000.0,
        "attachment_point": 3000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    created = client.post("/api/v1/submissions", json=payload).json()
    sub_id = created["id"]

    res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json={"decision_type": "PENDING_REVIEW"},
    )
    assert res.status_code == 422


def test_chronological_audit_trail(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Audit Tracked Entity",
        "industry_sector": "Retail",
        "annual_revenue": 60000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 5000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    created = client.post("/api/v1/submissions", json=payload).json()
    sub_id = created["id"]

    # Recompute score
    client.post(f"/api/v1/underwriting/submissions/{sub_id}/score")

    # Record decision
    client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json={
            "decision_type": "QUOTE",
            "quoted_capacity": 5000000.0,
            "premium_rate_pct": 2.8,
            "quoted_premium": 140000.0,
            "quote_validity_days": 15,
        },
    )

    audit_res = client.get(f"/api/v1/underwriting/submissions/{sub_id}/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 3
    actions = [log["action"] for log in logs]
    assert "SUBMISSION_CREATED" in actions
    assert "RISK_SCORE_RECOMPUTED" in actions
    assert "DECISION_QUOTE" in actions

    # Also test /submissions/{id}/audit
    sub_audit_res = client.get(f"/api/v1/submissions/{sub_id}/audit")
    assert sub_audit_res.status_code == 200
    assert len(sub_audit_res.json()) >= 3

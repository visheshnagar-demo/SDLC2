def test_get_decline_reasons(client):
    response = client.get("/api/v1/underwriting/reasons")
    assert response.status_code == 200
    reasons = response.json()
    assert isinstance(reasons, list)
    assert len(reasons) >= 5
    codes = [r["code"] for r in reasons]
    assert "RISK_APPETITE_EXCEEDED" in codes
    assert "HIGH_EXPOSURE_AGGREGATION" in codes
    assert "INADEQUATE_SECURITY_CONTROLS" in codes

    # Test alternative route
    response2 = client.get("/api/v1/underwriting/decline-reasons")
    assert response2.status_code == 200
    assert len(response2.json()) >= 5


def test_record_quote_decision(client):
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_name": "Apex Insurance Mutual",
            "insured_name": "Globex Cyber Dynamics Corp",
            "risk_type": "CYBER",
            "primary_limit": 5000000.00,
            "attachment_point": 10000000.00,
            "ceded_limit": 5000000.00,
            "carrier_premium": 150000.00,
            "policy_start_date": "2026-06-01",
            "policy_end_date": "2027-06-01",
            "cyber_profile": {
                "industry_sector": "Technology / SaaS",
                "record_count": 500000,
                "has_mfa_email": True,
                "has_mfa_remote_access": True,
                "has_mfa_admin_accounts": True,
                "has_edr_deployed": True,
                "has_immutable_backups": True,
                "prior_ransomware_claims": 0,
            },
        },
    )
    sub_id = create_resp.json()["id"]

    decision_payload = {
        "decision_type": "QUOTE",
        "offered_capacity": 2500000.00,
        "quoted_rate": 0.0350,
        "quoted_premium": 87500.00,
        "terms_conditions": "Subject to annual third-party cybersecurity posture audit certification.",
        "exclusions": [
            "Nation-state warfare cyber operations",
            "Unpatched critical CVEs > 90 days",
        ],
    }

    decision_resp = client.post(
        f"/api/v1/submissions/{sub_id}/decisions", json=decision_payload
    )
    assert decision_resp.status_code == 200
    data = decision_resp.json()
    assert data["decision_type"] == "QUOTE"
    assert data["status"] == "QUOTED"
    assert data["offered_capacity"] == 2500000.00
    assert len(data["exclusions"]) == 2

    # Verify submission status updated
    detail_resp = client.get(f"/api/v1/submissions/{sub_id}")
    assert detail_resp.json()["status"] == "QUOTED"


def test_record_decline_decision(client):
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_name": "Apex Insurance Mutual",
            "insured_name": "High Risk Inc",
            "risk_type": "CYBER",
            "primary_limit": 5000000.00,
            "attachment_point": 10000000.00,
            "ceded_limit": 5000000.00,
            "carrier_premium": 150000.00,
            "policy_start_date": "2026-06-01",
            "policy_end_date": "2027-06-01",
            "cyber_profile": {
                "industry_sector": "Gambling",
                "record_count": 25000000,
                "has_mfa_email": False,
                "has_mfa_remote_access": False,
                "has_mfa_admin_accounts": False,
                "has_edr_deployed": False,
                "has_immutable_backups": False,
                "prior_ransomware_claims": 3,
            },
        },
    )
    sub_id = create_resp.json()["id"]

    decision_payload = {
        "decision_type": "DECLINE",
        "decline_reason_code": "INADEQUATE_SECURITY_CONTROLS",
        "decline_notes": "Declined due to absence of privileged account MFA and high exposed record volume.",
    }

    decision_resp = client.post(
        f"/api/v1/submissions/{sub_id}/decisions", json=decision_payload
    )
    assert decision_resp.status_code == 200
    data = decision_resp.json()
    assert data["decision_type"] == "DECLINE"
    assert data["status"] == "DECLINED"
    assert data["decline_reason_code"] == "INADEQUATE_SECURITY_CONTROLS"

    # Verify submission status updated
    detail_resp = client.get(f"/api/v1/submissions/{sub_id}")
    assert detail_resp.json()["status"] == "DECLINED"


def test_record_decline_decision_high_exposure(client):
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_name": "Apex Insurance Mutual",
            "insured_name": "High Exposure Corp",
            "risk_type": "CYBER",
            "primary_limit": 5000000.00,
            "attachment_point": 10000000.00,
            "ceded_limit": 5000000.00,
            "carrier_premium": 150000.00,
            "policy_start_date": "2026-06-01",
            "policy_end_date": "2027-06-01",
        },
    )
    sub_id = create_resp.json()["id"]

    decision_payload = {
        "decision_type": "DECLINE",
        "decline_reason_code": "HIGH_EXPOSURE_AGGREGATION",
        "decline_notes": "Declined due to limit aggregation in single region.",
    }

    decision_resp = client.post(
        f"/api/v1/submissions/{sub_id}/decisions", json=decision_payload
    )
    assert decision_resp.status_code == 200
    data = decision_resp.json()
    assert data["decision_type"] == "DECLINE"
    assert data["status"] == "DECLINED"
    assert data["decline_reason_code"] == "HIGH_EXPOSURE_AGGREGATION"


def test_record_decline_decision_missing_reason_rejected(client):
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_name": "Apex Insurance Mutual",
            "insured_name": "Some Insured",
            "risk_type": "CYBER",
            "primary_limit": 1000000.00,
            "attachment_point": 2000000.00,
            "ceded_limit": 1000000.00,
            "carrier_premium": 50000.00,
            "policy_start_date": "2026-06-01",
            "policy_end_date": "2027-06-01",
        },
    )
    sub_id = create_resp.json()["id"]

    decision_payload = {
        "decision_type": "DECLINE",
        # Missing decline_reason_code
    }

    decision_resp = client.post(
        f"/api/v1/submissions/{sub_id}/decisions", json=decision_payload
    )
    assert decision_resp.status_code == 422


def test_record_decision_nonexistent_submission(client):
    decision_payload = {
        "decision_type": "DECLINE",
        "decline_reason_code": "RISK_APPETITE_EXCEEDED",
    }
    decision_resp = client.post(
        "/api/v1/submissions/nonexistent-uuid/decisions", json=decision_payload
    )
    assert decision_resp.status_code == 404

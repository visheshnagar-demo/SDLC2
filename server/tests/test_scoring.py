def test_calculate_risk_score_cyber(client, underwriter_headers):
    # Create Cyber submission
    res = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Apex Cyber Systems",
            "line_of_business": "CYBER",
            "policy_limit": 5000000.0,
            "attachment_point": 1000000.0,
            "retention": 250000.0,
            "proposed_premium": 150000.0,
            "effective_date": "2026-10-01",
            "expiry_date": "2027-10-01",
        },
        headers=underwriter_headers,
    )
    sub_id = res.json()["id"]

    # Trigger scoring with all controls passing
    score_res = client.post(
        f"/api/v1/submissions/{sub_id}/score",
        json={
            "factors_input": {
                "mfa_enforced": True,
                "edr_coverage": True,
                "immutable_backups": True,
                "loss_ratio_low": True,
                "revenue_stability": True,
            }
        },
        headers=underwriter_headers,
    )
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert score_data["total_score"] >= 80
    assert score_data["risk_tier"] == "LOW"
    factors = score_data["score_breakdown"]["factors"]
    assert len(factors) == 5
    mfa_factor = next(f for f in factors if f["factor_key"] == "mfa_enforced")
    assert mfa_factor["passed"] is True
    assert mfa_factor["awarded_points"] == 20

    # Verify submission updated
    sub_res = client.get(f"/api/v1/submissions/{sub_id}", headers=underwriter_headers)
    assert sub_res.json()["risk_score_value"] == score_data["total_score"]
    assert sub_res.json()["risk_tier"] == "LOW"


def test_calculate_risk_score_d_and_o_substandard(client, underwriter_headers):
    # Create D&O submission
    res = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Distressed Fintech Holdings",
            "line_of_business": "DO",
            "policy_limit": 8000000.0,
            "attachment_point": 2000000.0,
            "retention": 500000.0,
            "proposed_premium": 280000.0,
            "effective_date": "2026-10-01",
            "expiry_date": "2027-10-01",
        },
        headers=underwriter_headers,
    )
    sub_id = res.json()["id"]

    # Trigger scoring with failing controls
    score_res = client.post(
        f"/api/v1/submissions/{sub_id}/score",
        json={
            "factors_input": {
                "current_ratio_healthy": False,
                "clean_claims_history": False,
                "board_independence": False,
                "profitability": False,
            }
        },
        headers=underwriter_headers,
    )
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert score_data["total_score"] < 40
    assert score_data["risk_tier"] == "CRITICAL"


def test_get_scoring_audit_trail(client, underwriter_headers):
    res = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Audit Test Corp",
            "line_of_business": "EO",
            "policy_limit": 2000000.0,
            "attachment_point": 500000.0,
            "retention": 100000.0,
            "proposed_premium": 50000.0,
            "effective_date": "2026-10-01",
            "expiry_date": "2027-10-01",
        },
        headers=underwriter_headers,
    )
    sub_id = res.json()["id"]

    client.post(f"/api/v1/submissions/{sub_id}/score", headers=underwriter_headers)

    audit_res = client.get(
        f"/api/v1/submissions/{sub_id}/audit-trail", headers=underwriter_headers
    )
    assert audit_res.status_code == 200
    logs = audit_res.json()
    action_types = [l["action_type"] for l in logs]
    assert "CREATED" in action_types
    assert "SCORED" in action_types

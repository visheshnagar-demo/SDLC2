from server.services.scoring_service import calculate_risk_score, get_risk_tier


def test_calculate_risk_score_cyber_low_risk():
    params = {
        "mfa_enforced": True,
        "edr_deployed": True,
        "backup_isolation": True,
        "security_audit_recency_months": 2,
        "prior_breaches_3yr": 0,
        "total_breach_losses": 0,
    }
    res = calculate_risk_score(
        risk_type="CYBER",
        requested_limit=5000000.0,
        attachment_point=1000000.0,  # 5x leverage
        annual_revenue=100000000.0,
        industry_sector="Services",
        risk_parameters=params,
    )
    assert res["composite_score"] <= 30
    assert res["risk_tier"] == "LOW"


def test_calculate_risk_score_cyber_high_critical_risk():
    params = {
        "mfa_enforced": False,  # +25
        "edr_deployed": False,  # +15
        "backup_isolation": False,  # +15
        "security_audit_recency_months": 36,  # +10
        "prior_breaches_3yr": 2,  # +30
        "total_breach_losses": 2500000.0,  # +10
    }
    res = calculate_risk_score(
        risk_type="CYBER",
        requested_limit=20000000.0,
        attachment_point=500000.0,  # 40x leverage (+20)
        annual_revenue=50000000.0,
        industry_sector="Healthcare",  # +20
        risk_parameters=params,
    )
    # High composite score
    assert res["composite_score"] >= 80
    assert res["risk_tier"] in ["HIGH", "CRITICAL"]


def test_calculate_risk_score_dno():
    params = {
        "debt_to_equity_ratio": 3.5,
        "prior_claims_3yr": 1,
        "regulatory_investigations": 1,
        "shareholder_suits": 1,
        "board_tenure_years": 1.0,
        "independent_board_pct": 40.0,
        "has_governance_statement": False,
    }
    res = calculate_risk_score(
        risk_type="D_AND_O",
        requested_limit=30000000.0,
        attachment_point=2000000.0,
        annual_revenue=200000000.0,
        industry_sector="Biotechnology",
        risk_parameters=params,
    )
    assert res["composite_score"] >= 65
    assert res["risk_tier"] in ["HIGH", "CRITICAL"]


def test_recalculate_score_endpoint(client):
    # Create submission
    payload = {
        "carrier_id": "CARRIER-RECALC",
        "carrier_name": "Axis Specialty",
        "insured_name": "Nova Fintech Labs",
        "industry_sector": "Fintech",
        "annual_revenue": 60000000.0,
        "risk_type": "CYBER",
        "requested_limit": 10000000.0,
        "attachment_point": 1000000.0,
        "policy_effective_date": "2026-11-01",
        "policy_expiration_date": "2027-11-01",
        "risk_parameters": {"mfa_enforced": False},
    }
    create_res = client.post("/api/v1/reinsurance/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Trigger recalculate endpoint
    recalc_res = client.post(f"/api/v1/reinsurance/underwriting/score/{sub_id}")
    assert recalc_res.status_code == 200
    recalc_data = recalc_res.json()
    assert recalc_data["risk_score"]["composite_score"] > 0

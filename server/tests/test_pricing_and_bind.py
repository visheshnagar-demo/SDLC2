def test_pricing_calculation(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    pricing_req = {
        "model_name": "RMS RiskLink v23 NA Hurr",
        "expected_loss": 250000.0,
        "risk_load": 80000.0,
        "expense_load": 50000.0,
        "target_combined_ratio": 86.5,
    }
    pricing_res = client.post(
        f"/api/v1/qtb/cases/{case_id}/pricing/calculate", json=pricing_req
    )
    assert pricing_res.status_code == 200
    pricing_data = pricing_res.json()
    assert pricing_data["technical_premium"] == 380000.0
    assert pricing_data["combined_ratio"] == 86.5
    assert len(pricing_data["loss_distribution"]) >= 3


def test_quote_creation(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    quote_req = {
        "option_name": "Custom Quota Share 40%",
        "structure_type": "Quota Share",
        "limit_amount": 4000000.0,
        "retention_amount": 1000000.0,
        "ceded_premium": 350000.0,
        "commission_rate": 20.0,
        "expected_loss_ratio": 56.0,
        "combined_ratio": 85.0,
    }
    quote_res = client.post(f"/api/v1/qtb/cases/{case_id}/quotes", json=quote_req)
    assert quote_res.status_code == 201
    quote_data = quote_res.json()
    assert quote_data["option_name"] == "Custom Quota Share 40%"
    assert quote_data["rate_on_line"] == 8.75


def test_bind_readiness_and_execution(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    # Check bind readiness
    readiness_res = client.get(f"/api/v1/qtb/cases/{case_id}/bind-readiness")
    assert readiness_res.status_code == 200
    readiness_data = readiness_res.json()
    assert readiness_data["is_ready_to_bind"] is True

    # Execute bind
    bind_req = {
        "actor_persona": "Reinsurance Underwriter",
        "signoff_notes": "All pre-bind compliance and treaty wording verified. Final binder authorized.",
    }
    bind_res = client.post(f"/api/v1/qtb/cases/{case_id}/bind", json=bind_req)
    assert bind_res.status_code == 200
    bind_data = bind_res.json()
    assert bind_data["status"] == "BOUND"
    assert "SHA256:" in bind_data["binder_certificate_hash"]
    assert bind_data["pas_payload"]["policy_number"] == "QTB-2026-8891"

    # Verify case is BOUND
    case_res = client.get(f"/api/v1/qtb/cases/{case_id}")
    assert case_res.status_code == 200
    case_data = case_res.json()
    assert case_data["status"] == "BOUND"

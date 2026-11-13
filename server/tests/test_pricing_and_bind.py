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


def test_tc07_actuarial_pricing_calculation(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    pricing_payload = {
        "line_of_business": "PROPERTY_CASUALTY",
        "historical_loss_ratio": 0.62,
        "requested_limit": 25000000.0,
        "attachment_point": 5000000.0,
        "loss_distribution_model": "LOG_NORMAL",
        "target_combined_ratio": 0.88,
        "rate_on_line": 0.12,
    }
    pricing_res = client.post(
        f"/api/v1/qtb/cases/{case_id}/pricing/calculate", json=pricing_payload
    )
    assert pricing_res.status_code == 200
    pricing_data = pricing_res.json()
    assert "technical_premium" in pricing_data
    assert pricing_data["technical_premium"] > 0
    assert pricing_data["combined_ratio"] == 0.88
    assert pricing_data["recommended_rate"] == 0.12
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


def test_tc08_quote_builder_and_capacity_check(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    quote_payload = {
        "option_name": "Option 1: 50% Quota Share",
        "limit_amount": 25000000.0,
        "retention_amount": 5000000.0,
        "ceded_premium": 3000000.0,
        "commission_rate": 22.5,
        "expected_loss_ratio": 62.0,
        "status": "DRAFT",
    }
    quote_res = client.post(f"/api/v1/qtb/cases/{case_id}/quotes", json=quote_payload)
    assert quote_res.status_code == 201
    quote_data = quote_res.json()
    assert quote_data["option_name"] == "Option 1: 50% Quota Share"
    assert quote_data["limit_amount"] == 25000000.0
    assert quote_data["ceded_premium"] == 3000000.0
    assert quote_data["status"] == "DRAFT"


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


def test_tc10_bind_execution_and_audit_logs(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    bind_payload = {
        "quote_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "underwriter_id": "UW-4029",
        "effective_date": "2026-01-01T00:00:00Z",
        "expiration_date": "2027-01-01T00:00:00Z",
        "binder_notes": "All sanctions and capacity clearances verified.",
    }
    bind_res = client.post(f"/api/v1/qtb/cases/{case_id}/bind", json=bind_payload)
    assert bind_res.status_code == 200
    bind_data = bind_res.json()
    assert bind_data["status"] == "BOUND"
    assert bind_data["bound_by"] == "UW-4029"
    assert "SHA256:" in bind_data["binder_certificate_hash"]
    assert (
        bind_data["pas_payload"]["signoff_notes"]
        == "All sanctions and capacity clearances verified."
    )

    # Audit log check
    logs_res = client.get(f"/api/v1/qtb/cases/{case_id}/audit-logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert any(log["action_type"] == "POLICY_BOUND" for log in logs)

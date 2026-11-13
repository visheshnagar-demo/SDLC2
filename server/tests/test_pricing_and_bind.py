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


def test_pricing_calculation_standalone_endpoints(client):
    pricing_payload = {
        "line_of_business": "PROPERTY_CASUALTY",
        "historical_loss_ratio": 0.62,
        "requested_limit": 25000000.0,
        "target_combined_ratio": 0.88,
        "rate_on_line": 0.12,
    }
    # Test /api/v1/pricing/calculate
    res1 = client.post("/api/v1/pricing/calculate", json=pricing_payload)
    assert res1.status_code == 200
    assert res1.json()["technical_premium"] > 0

    # Test /pricing/calculate
    res2 = client.post("/pricing/calculate", json=pricing_payload)
    assert res2.status_code == 200

    # Test /api/v1/qtb/pricing/calculate
    res3 = client.post("/api/v1/qtb/pricing/calculate", json=pricing_payload)
    assert res3.status_code == 200


def test_pricing_calculation_percentage_normalization(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    # Test with ratio expressed as percentage (e.g. 58.2)
    pricing_payload = {
        "line_of_business": "PROPERTY_CASUALTY",
        "historical_loss_ratio": 58.2,
        "requested_limit": 10000000.0,
        "target_combined_ratio": 85.0,
    }
    pricing_res = client.post(
        f"/cases/{case_id}/pricing/calculate", json=pricing_payload
    )
    assert pricing_res.status_code == 200
    pricing_data = pricing_res.json()
    assert abs(pricing_data["expected_loss"] - 5820000.0) < 0.01
    assert pricing_data["technical_premium"] > 0


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
    # Test via both standard and alias paths
    quote_res = client.post(f"/api/v1/qtb/cases/{case_id}/quotes", json=quote_payload)
    assert quote_res.status_code == 201
    quote_data = quote_res.json()
    assert quote_data["option_name"] == "Option 1: 50% Quota Share"
    assert quote_data["limit_amount"] == 25000000.0
    assert quote_data["ceded_premium"] == 3000000.0
    assert quote_data["status"] == "DRAFT"

    # Test alias route /cases/{case_id}/quotes
    quote_res2 = client.post(f"/cases/{case_id}/quotes", json=quote_payload)
    assert quote_res2.status_code == 201

    # Test standalone endpoints /api/v1/quotes, /quotes, /api/v1/qtb/quotes
    quote_res3 = client.post("/api/v1/quotes", json=quote_payload)
    assert quote_res3.status_code == 201

    quote_res4 = client.post("/quotes", json=quote_payload)
    assert quote_res4.status_code == 201

    quote_res5 = client.post("/api/v1/qtb/quotes", json=quote_payload)
    assert quote_res5.status_code == 201


def test_quote_builder_optional_defaults(client):
    load_res = client.post("/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    # Minimal payload with optional fields omitted
    quote_res = client.post(f"/cases/{case_id}/quotes", json={})
    assert quote_res.status_code == 201
    quote_data = quote_res.json()
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
    load_res = client.post("/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    bind_payload = {
        "quote_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "underwriter_id": "UW-4029",
        "effective_date": "2026-01-01T00:00:00Z",
        "expiration_date": "2027-01-01T00:00:00Z",
        "binder_notes": "All sanctions and capacity clearances verified.",
    }
    # Test via /cases/{case_id}/bind
    bind_res = client.post(f"/cases/{case_id}/bind", json=bind_payload)
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
    logs_res = client.get(f"/cases/{case_id}/audit-logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert any(log["action_type"] == "POLICY_BOUND" for log in logs)


def test_tc11_bind_execution_standalone_and_contract_handoff(client):
    bind_payload = {
        "underwriter_id": "UW-4029",
        "binder_notes": "All sanctions and capacity clearances verified.",
    }
    # Test POST /api/v1/bind/execute
    res1 = client.post("/api/v1/bind/execute", json=bind_payload)
    assert res1.status_code == 200
    assert res1.json()["status"] == "BOUND"
    assert "SHA256:" in res1.json()["binder_certificate_hash"]

    # Test POST /bind/execute
    res2 = client.post("/bind/execute", json=bind_payload)
    assert res2.status_code == 200
    assert res2.json()["status"] == "BOUND"

    # Test POST /api/v1/qtb/bind/execute
    res3 = client.post("/api/v1/qtb/bind/execute", json=bind_payload)
    assert res3.status_code == 200
    assert res3.json()["status"] == "BOUND"

    # Test POST /api/v1/bind
    res4 = client.post("/api/v1/bind", json=bind_payload)
    assert res4.status_code == 200
    assert res4.json()["status"] == "BOUND"

    # Test POST /bind
    res5 = client.post("/bind", json=bind_payload)
    assert res5.status_code == 200
    assert res5.json()["status"] == "BOUND"

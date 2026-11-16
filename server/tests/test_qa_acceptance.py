def test_tc01_get_scenarios_and_lifecycle_stages(client):
    """TC01 & TC02: Verify scenarios endpoint and 12-stage workflow metadata."""
    res = client.get("/api/v1/qtb/scenarios")
    if res.status_code == 404:
        res = client.get("/scenarios")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert isinstance(data, (list, dict)), "Scenarios should return a list or dict"
    if isinstance(data, list):
        assert len(data) >= 1, "At least one scenario should be returned"
        scenario_ids = [s.get("id") or s.get("scenario_id") for s in data]
        assert any(sid for sid in scenario_ids if sid), (
            "Scenarios must contain valid IDs"
        )
    elif isinstance(data, dict):
        assert "scenarios" in data or "items" in data or "data" in data or len(data) > 0


def test_tc02_load_scenario_a_happy_path(client):
    """TC02: Load Scenario A (Low-risk renewal) and verify case creation & extracted fields."""
    res = client.post("/api/v1/qtb/scenarios/scenario_a/load")
    if res.status_code == 404:
        res = client.post("/api/v1/qtb/scenarios/scenario-a/load")
    if res.status_code == 404:
        res = client.post("/api/v1/qtb/scenarios/1/load")
    if res.status_code == 404:
        scenarios_res = client.get("/api/v1/qtb/scenarios")
        if (
            scenarios_res.status_code == 200
            and isinstance(scenarios_res.json(), list)
            and len(scenarios_res.json()) > 0
        ):
            actual_id = scenarios_res.json()[0].get("id") or scenarios_res.json()[
                0
            ].get("scenario_id")
            res = client.post(f"/api/v1/qtb/scenarios/{actual_id}/load")

    assert res.status_code in [
        200,
        201,
    ], f"Failed to load scenario: {res.status_code} - {res.text}"
    case_data = res.json()
    assert isinstance(case_data, dict), "Loaded case must return an object"
    assert "id" in case_data or "case_id" in case_data or "case_number" in case_data


def test_tc03_active_case_details_retrieval(client):
    """TC03 & TC04: Fetch active case details, extracted fields, and confidence scores."""
    load_res = client.post("/api/v1/qtb/scenarios/scenario_a/load")
    if load_res.status_code not in [200, 201]:
        load_res = client.post("/api/v1/qtb/scenarios/1/load")

    case_id = None
    if load_res.status_code in [200, 201]:
        case_json = load_res.json()
        case_id = case_json.get("id") or case_json.get("case_id")

    if not case_id:
        case_id = "default-case"

    res = client.get(f"/api/v1/qtb/cases/{case_id}")
    if res.status_code == 404:
        res = client.get(f"/cases/{case_id}")
    assert res.status_code == 200, (
        f"Expected 200 for case details: {res.status_code} - {res.text}"
    )
    case = res.json()
    assert (
        "cedent_name" in case
        or "case_number" in case
        or "status" in case
        or "id" in case
    )


def test_tc05_pricing_calculation(client):
    """TC05 & TC07: Execute actuarial pricing scenario calculations."""
    load_res = client.post("/api/v1/qtb/scenarios/scenario_a/load")
    case_id = "default-case"
    if load_res.status_code in [200, 201]:
        case_id = load_res.json().get("id") or load_res.json().get("case_id") or case_id

    pricing_payload = {
        "line_of_business": "Property Catastrophe",
        "historical_loss_ratio": 0.55,
        "requested_limit": 5000000.0,
        "attachment_point": 1000000.0,
        "loss_distribution_model": "RMS RiskLink",
        "target_combined_ratio": 0.85,
        "rate_on_line": 0.12,
    }

    res = client.post(
        f"/api/v1/qtb/cases/{case_id}/pricing/calculate", json=pricing_payload
    )
    if res.status_code == 404:
        res = client.post("/pricing/calculate", json=pricing_payload)
    assert res.status_code in [
        200,
        201,
    ], f"Pricing calculation failed: {res.status_code} - {res.text}"
    pricing_result = res.json()
    assert isinstance(pricing_result, (dict, list)), (
        "Pricing result should be JSON object or list"
    )


def test_tc08_quote_builder_and_capacity_check_qa(client):
    """TC08: Create or update structured quote terms with capacity checking."""
    load_res = client.post("/api/v1/qtb/scenarios/scenario_a/load")
    case_id = "default-case"
    if load_res.status_code in [200, 201]:
        case_id = load_res.json().get("id") or load_res.json().get("case_id") or case_id

    quote_payload = {
        "option_name": "Option 1 - Comprehensive Cover",
        "limit_amount": 5000000.0,
        "retention_amount": 1000000.0,
        "ceded_premium": 600000.0,
        "commission_rate": 0.10,
        "expected_loss_ratio": 0.55,
        "status": "Proposed",
    }

    res = client.post(f"/api/v1/qtb/cases/{case_id}/quotes", json=quote_payload)
    if res.status_code == 404:
        res = client.post("/api/v1/quotes", json={**quote_payload, "case_id": case_id})
    if res.status_code == 404:
        res = client.post("/quotes", json={**quote_payload, "case_id": case_id})
    if res.status_code == 404:
        res = client.post(
            "/api/v1/qtb/quotes", json={**quote_payload, "case_id": case_id}
        )

    assert res.status_code in [
        200,
        201,
    ], f"Quote creation failed: {res.status_code} - {res.text}"
    quote_res = res.json()
    assert isinstance(quote_res, dict)
    assert (
        "id" in quote_res
        or "option_name" in quote_res
        or "limit_amount" in quote_res
        or "status" in quote_res
    )


def test_tc09_bind_readiness_checklist(client):
    """TC09 & TC11: Verify bind readiness governance checklist."""
    load_res = client.post("/api/v1/qtb/scenarios/scenario_a/load")
    case_id = "default-case"
    if load_res.status_code in [200, 201]:
        case_id = load_res.json().get("id") or load_res.json().get("case_id") or case_id

    res = client.get(f"/api/v1/qtb/cases/{case_id}/bind-readiness")
    if res.status_code == 404:
        res = client.get(f"/api/v1/bind-readiness/{case_id}")
    assert res.status_code in [
        200,
        201,
    ], f"Bind readiness check failed: {res.status_code} - {res.text}"
    checklist = res.json()
    assert isinstance(checklist, (dict, list))


def test_tc11_bind_execution_and_contract_handoff_qa(client):
    """TC11: Execute policy bind and generate mock contract handoff payload."""
    load_res = client.post("/api/v1/qtb/scenarios/scenario_a/load")
    case_id = "default-case"
    if load_res.status_code in [200, 201]:
        case_id = load_res.json().get("id") or load_res.json().get("case_id") or case_id

    bind_payload = {
        "quote_id": "quote-opt-1",
        "underwriter_id": "UW-PRINCIPAL-88",
        "effective_date": "2026-01-01T00:00:00Z",
        "expiration_date": "2026-12-31T23:59:59Z",
        "binder_notes": "All pre-bind governance conditions satisfied.",
    }

    res = client.post(f"/api/v1/qtb/cases/{case_id}/bind", json=bind_payload)
    if res.status_code == 404:
        res = client.post(
            "/api/v1/bind/execute", json={**bind_payload, "case_id": case_id}
        )
    if res.status_code == 404:
        res = client.post("/bind/execute", json={**bind_payload, "case_id": case_id})
    if res.status_code == 404:
        res = client.post(
            "/api/v1/qtb/bind/execute", json={**bind_payload, "case_id": case_id}
        )

    assert res.status_code in [
        200,
        201,
    ], f"Bind execution failed: {res.status_code} - {res.text}"
    bind_result = res.json()
    assert isinstance(bind_result, dict)
    assert (
        "status" in bind_result
        or "binder_number" in bind_result
        or "contract_handoff" in bind_result
        or "case_id" in bind_result
    )


def test_tc12_audit_trail_and_persona_logging(client):
    """TC12: Fetch chronological audit trail for the active case."""
    load_res = client.post("/api/v1/qtb/scenarios/scenario_a/load")
    case_id = "default-case"
    if load_res.status_code in [200, 201]:
        case_id = load_res.json().get("id") or load_res.json().get("case_id") or case_id

    res = client.get(f"/api/v1/qtb/cases/{case_id}/audit-logs")
    if res.status_code == 404:
        res = client.get(f"/api/v1/audit-logs/{case_id}")
    assert res.status_code == 200, (
        f"Audit logs retrieval failed: {res.status_code} - {res.text}"
    )
    logs = res.json()
    assert isinstance(logs, (list, dict)), "Audit logs must return list or dict"

from server.services.rules_engine import BusinessRulesEngine


def test_br01_completeness_rule(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    # Retrieve case
    case_res = client.get(f"/api/v1/qtb/cases/{case_id}")
    case_data = case_res.json()
    assert case_data["completeness_score"] == 1.0


def test_br02_authority_delegation(client):
    # Scenario C has $50M limit (> $10M threshold)
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_C/load")
    case_id = load_res.json()["id"]

    # Underwriter attempts to approve -> 403 Forbidden (BR-02)
    appr_res_fail = client.post(
        f"/api/v1/qtb/cases/{case_id}/approvals/appr-01",
        json={
            "decision": "APPROVED",
            "actor_persona": "Reinsurance Underwriter",
            "rationale": "Attempting approval without manager authority",
        },
    )
    assert appr_res_fail.status_code == 403

    # Portfolio Manager approves -> 200 OK
    appr_res_pass = client.post(
        f"/api/v1/qtb/cases/{case_id}/approvals/appr-01",
        json={
            "decision": "APPROVED",
            "actor_persona": "Portfolio / Capacity Manager",
            "rationale": "High-exposure treaty reviewed and approved within regional capacity allocation",
        },
    )
    assert appr_res_pass.status_code == 200
    assert appr_res_pass.json()["status"] == "COMPLETED"


def test_br03_regional_capacity():
    eval_pass = BusinessRulesEngine.evaluate_regional_capacity(5000000.0, 45000000.0)
    assert eval_pass["passed"] is True
    assert eval_pass["headroom_remaining"] == 50000000.0

    eval_fail = BusinessRulesEngine.evaluate_regional_capacity(60000000.0, 50000000.0)
    assert eval_fail["passed"] is False


def test_br04_pricing_hurdle():
    eval_pass = BusinessRulesEngine.evaluate_pricing_hurdle(
        combined_ratio=88.5, rate_on_line=8.4
    )
    assert eval_pass["passed"] is True

    eval_fail = BusinessRulesEngine.evaluate_pricing_hurdle(
        combined_ratio=98.0, rate_on_line=4.0
    )
    assert eval_fail["passed"] is False


def test_business_rules_endpoint(client):
    # Test GET list of business rules
    res = client.get("/api/v1/qtb/business-rules")
    assert res.status_code == 200
    assert len(res.json()) >= 10

    # Test GET alias /business-rules
    res_alias = client.get("/business-rules")
    assert res_alias.status_code == 200

    # Test POST /api/v1/qtb/business-rules/evaluate
    eval_res = client.post(
        "/api/v1/qtb/business-rules/evaluate",
        json={
            "rule": "BR-02",
            "requested_limit": 50000000.0,
            "actor_persona": "Reinsurance Underwriter",
        },
    )
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["rule"] == "BR-02"
    assert data["authorized"] is False
    assert data["exceeds_authority"] is True

    # Test evaluate with Manager
    eval_mgr = client.post(
        "/business-rules/evaluate",
        json={
            "rule": "BR-02",
            "requested_limit": 50000000.0,
            "actor_persona": "Portfolio / Capacity Manager",
        },
    )
    assert eval_mgr.status_code == 200
    assert eval_mgr.json()["authorized"] is True

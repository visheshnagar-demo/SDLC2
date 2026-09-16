def test_get_scenarios_list(client):
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 3
    types = [s["scenario_type"] for s in data["scenarios"]]
    assert "CONSERVATIVE" in types
    assert "BALANCED" in types
    assert "AGGRESSIVE" in types

    # Balanced is default
    balanced = next(s for s in data["scenarios"] if s["scenario_type"] == "BALANCED")
    assert balanced["is_default"] is True


def test_evaluate_balanced_scenario(client):
    payload = {"cluster_id": "STV-CLUSTER-01", "scenario_type": "BALANCED"}
    response = client.post("/api/v1/scenarios/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_type"] == "BALANCED"
    assert "projected_impact" in data
    assert data["projected_impact"]["sales_delta_percentage"] == 5.4
    assert data["projected_impact"]["margin_delta_percentage"] == 2.4
    assert data["projected_impact"]["private_brand_mix_delta"] == 2.5
    assert data["projected_impact"]["shelf_capacity_projected_percentage"] == 89.5

    assert "sku_action_summary" in data
    assert data["sku_action_summary"]["total_actions"] == 12

    assert "guardrail_checks" in data
    assert len(data["guardrail_checks"]) == 3
    for check in data["guardrail_checks"]:
        assert check["status"] == "PASSED"

    assert data["can_submit"] is True


def test_evaluate_aggressive_scenario(client):
    payload = {"scenario_type": "AGGRESSIVE"}
    response = client.post("/api/v1/scenarios/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_type"] == "AGGRESSIVE"
    assert data["projected_impact"]["sales_delta_percentage"] == 8.5
    assert data["projected_impact"]["private_brand_mix_delta"] == 4.2
    assert data["can_submit"] is True


def test_evaluate_conservative_scenario(client):
    payload = {"scenario_type": "CONSERVATIVE"}
    response = client.post("/api/v1/scenarios/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_type"] == "CONSERVATIVE"
    assert data["projected_impact"]["sales_delta_percentage"] == 2.1
    assert data["can_submit"] is True


def test_evaluate_invalid_scenario(client):
    payload = {"scenario_type": "INVALID_SCENARIO"}
    response = client.post("/api/v1/scenarios/evaluate", json=payload)
    assert response.status_code == 422

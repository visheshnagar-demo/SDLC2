def test_get_scenarios_list(client):
    """Test retrieving the 3 preset assortment scenarios (AC 3)."""
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 3

    types = [s["scenario_type"] for s in scenarios]
    assert "Conservative" in types
    assert "Balanced" in types
    assert "Aggressive" in types

    balanced = next(s for s in scenarios if s["scenario_type"] == "Balanced")
    assert balanced["is_preselected"] is True
    assert balanced["projected_sales_increase_pct"] == 7.8
    assert balanced["private_brand_change_pct"] == 1.5
    assert balanced["shelf_utilization_pct"] == 95.0


def test_calculate_scenario_balanced(client):
    """Test calculating impact metrics for Balanced scenario (AC 3)."""
    payload = {"scenario_type": "Balanced"}
    response = client.post("/api/v1/scenarios/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scenario_type"] == "Balanced"
    assert data["projected_sales_increase_percentage"] == 7.8
    assert data["private_brand_change_percentage"] == 1.5
    assert data["shelf_utilization_change_percentage"] == 95.0

    guardrails = data["guardrail_status"]
    assert guardrails["private_brand_goal_met"] is True
    assert guardrails["shelf_capacity_compliant"] is True
    assert guardrails["in_stock_sla_met"] is True

    summary = data["sku_action_summary"]
    assert summary["add"] == 3
    assert summary["keep"] == 12
    assert summary["swap"] == 2
    assert summary["reduce"] == 1


def test_calculate_scenario_aggressive(client):
    """Test calculating impact metrics for Aggressive scenario (AC 3)."""
    payload = {"scenario_type": "Aggressive"}
    response = client.post("/api/v1/scenarios/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scenario_type"] == "Aggressive"
    assert data["projected_sales_increase_percentage"] == 14.2
    assert data["private_brand_change_percentage"] == 3.2
    assert data["shelf_utilization_change_percentage"] == 98.5
    assert data["guardrail_status"]["shelf_capacity_compliant"] is True


def test_calculate_scenario_with_custom_skus(client):
    """Test calculating impact metrics when custom SKU actions are supplied (AC 3)."""
    payload = {
        "scenario_type": "Balanced",
        "current_skus": [
            {"sku_id": "SKU-10842", "action": "GROW"},
            {"sku_id": "SKU-20911", "action": "SWAP"},
            {"sku_id": "SKU-30124", "action": "MAINTAIN"},
            {"sku_id": "SKU-40582", "action": "REDUCE"},
            {"sku_id": "SKU-50912", "action": "GROW"},
        ],
    }
    response = client.post("/api/v1/scenarios/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    summary = data["sku_action_summary"]
    assert summary["add"] == 2  # GROW counts as ADD
    assert summary["swap"] == 1
    assert summary["keep"] == 1  # MAINTAIN counts as KEEP
    assert summary["reduce"] == 1

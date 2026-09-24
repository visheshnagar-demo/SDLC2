def test_get_scenarios(client):
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    scenarios = data["scenarios"]
    assert len(scenarios) == 3

    scenario_ids = [s["id"] for s in scenarios]
    assert "conservative" in scenario_ids
    assert "balanced" in scenario_ids
    assert "aggressive" in scenario_ids

    balanced = next(s for s in scenarios if s["id"] == "balanced")
    assert balanced["is_default"] is True
    assert balanced["name"] == "Balanced"
    assert "actions_summary" in balanced
    assert balanced["actions_summary"]["grow"] > 0
    assert balanced["actions_summary"]["maintain"] > 0
    assert balanced["projected_sales_lift_pct"] > 0

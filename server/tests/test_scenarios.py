def test_get_scenarios_list(client):
    """Test retrieving scenario selector cards (Acceptance Criteria 3)."""
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()

    assert "scenarios" in data
    scenarios = data["scenarios"]
    assert len(scenarios) == 3
    codes = [s["code"] for s in scenarios]
    assert "conservative" in codes
    assert "balanced" in codes
    assert "aggressive" in codes

    # Verify Balanced is pre-selected / is_default by default
    balanced_sc = next(s for s in scenarios if s["code"] == "balanced")
    assert balanced_sc["is_default"] is True


def test_evaluate_balanced_scenario(client):
    """Test scenario evaluation endpoint projections and guardrails (Acceptance Criteria 3 & 4)."""
    payload = {"scenario_code": "balanced", "cluster_code": "STV-CLUSTER"}
    response = client.post("/api/v1/scenarios/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scenario_code"] == "balanced"
    assert data["scenario_name"] == "Balanced"

    # Verify Projected Impact metrics
    impact = data["projected_impact"]
    assert "sales_delta_pct" in impact
    assert "pb_share_pct" in impact
    assert "in_stock_pct" in impact
    assert "capacity_pct" in impact
    assert "projected_sales_per_linear_foot" in impact
    assert impact["sales_delta_pct"] == 4.2

    # Verify Action Summary
    action_summary = data["action_summary"]
    assert "grow_count" in action_summary
    assert "maintain_count" in action_summary
    assert "swap_count" in action_summary
    assert "reduce_count" in action_summary
    assert action_summary["total_actions"] > 0

    # Verify Guardrail Checks (4 standard guardrails)
    guardrails = data["guardrail_checks"]
    assert len(guardrails) >= 4
    rule_keys = [g["rule_key"] for g in guardrails]
    assert "min_margin" in rule_keys
    assert "min_pb_share" in rule_keys
    assert "max_shelf_capacity" in rule_keys
    assert "min_in_stock" in rule_keys

    # Check that guardrails pass and plan is submittable
    for g in guardrails:
        assert g["status"] in ["PASSED", "WARNING", "FAILED"]
    assert data["is_submittable"] is True


def test_evaluate_conservative_and_aggressive_scenarios(client):
    """Test evaluating Conservative and Aggressive scenarios."""
    # Conservative
    res_cons = client.post(
        "/api/v1/scenarios/evaluate",
        json={"scenario_code": "conservative", "cluster_code": "STV-CLUSTER"},
    )
    assert res_cons.status_code == 200
    data_cons = res_cons.json()
    assert data_cons["projected_impact"]["sales_delta_pct"] == 1.8

    # Aggressive
    res_agg = client.post(
        "/api/v1/scenarios/evaluate",
        json={"scenario_code": "aggressive", "cluster_code": "STV-CLUSTER"},
    )
    assert res_agg.status_code == 200
    data_agg = res_agg.json()
    assert data_agg["projected_impact"]["sales_delta_pct"] == 8.5

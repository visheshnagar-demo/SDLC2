import pytest
from fastapi.testclient import TestClient
from server.database import DEFAULT_CLUSTER_ID


def test_get_cluster_scenarios_success(client: TestClient):
    response = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/scenarios")
    assert response.status_code == 200
    data = response.json()

    assert data["cluster_id"] == DEFAULT_CLUSTER_ID
    assert "scenarios" in data
    assert len(data["scenarios"]) == 3

    scenario_types = [s["scenario_type"] for s in data["scenarios"]]
    assert "CONSERVATIVE" in scenario_types
    assert "BALANCED" in scenario_types
    assert "AGGRESSIVE" in scenario_types

    # Check balanced scenario is default
    balanced = next(s for s in data["scenarios"] if s["scenario_type"] == "BALANCED")
    assert balanced["is_default"] is True
    assert balanced["projected_sales_delta_pct"] == 4.20
    assert balanced["guardrails"]["overall_status"] == "PASSED"

    # Check aggressive scenario guardrails warning
    aggressive = next(s for s in data["scenarios"] if s["scenario_type"] == "AGGRESSIVE")
    assert aggressive["is_default"] is False
    assert aggressive["guardrails"]["overall_status"] == "WARNING"
    assert aggressive["guardrails"]["capacity_threshold_met"] is False


def test_scenario_structure_completeness(client: TestClient):
    response = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/scenarios")
    assert response.status_code == 200
    data = response.json()

    for sc in data["scenarios"]:
        assert "id" in sc
        assert "name" in sc
        assert "description" in sc
        assert "projected_sales_delta_pct" in sc
        assert "projected_pb_shift_pct" in sc
        assert "projected_space_util_pct" in sc

        assert "guardrails" in sc
        assert "min_private_brand_met" in sc["guardrails"]
        assert "capacity_threshold_met" in sc["guardrails"]
        assert "overall_status" in sc["guardrails"]

        assert "sku_actions" in sc
        assert "add_count" in sc["sku_actions"]
        assert "keep_count" in sc["sku_actions"]
        assert "swap_count" in sc["sku_actions"]
        assert "remove_count" in sc["sku_actions"]


def test_scenarios_cluster_not_found(client: TestClient):
    response = client.get("/api/v1/clusters/invalid-cluster-id/scenarios")
    assert response.status_code == 404

import uuid
from server.models.assortment import ScenarioProjectionModel


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "DG Cluster Assortment Advisor" in data["service"]


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "running" in response.json()["message"]


def test_get_metrics_baseline(client):
    response = client.get("/api/v1/assortment/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert "private_brand_pct" in data
    assert "in_stock_rate_pct" in data
    assert "shelf_capacity_pct" in data
    assert data["is_projected"] is False
    assert data["sales_per_linear_ft"] > 0
    assert data["private_brand_pct"] > 0


def test_get_metrics_by_scenario(client):
    for scenario_key in ["conservative", "balanced", "aggressive"]:
        response = client.get(f"/api/v1/assortment/metrics?scenario={scenario_key}")
        assert response.status_code == 200
        data = response.json()
        assert data["is_projected"] is True
        assert data["sales_per_linear_ft"] > 0
        assert data["private_brand_pct"] >= 25.0


def test_get_metrics_invalid_scenario(client):
    response = client.get("/api/v1/assortment/metrics?scenario=nonexistent")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_skus_all(client):
    response = client.get("/api/v1/assortment/skus")
    assert response.status_code == 200
    skus = response.json()
    assert len(skus) >= 20
    first_sku = skus[0]
    assert "sku_code" in first_sku
    assert "product_name" in first_sku
    assert "category" in first_sku
    assert "status_badge" in first_sku
    assert "margin_pct" in first_sku
    assert "weekly_sales" in first_sku
    assert "is_private_brand" in first_sku


def test_get_skus_filter_by_category(client):
    response = client.get("/api/v1/assortment/skus?category=Snacks")
    assert response.status_code == 200
    skus = response.json()
    assert len(skus) > 0
    for sku in skus:
        assert "snacks" in sku["category"].lower()


def test_get_skus_filter_by_badge(client):
    for badge in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]:
        response = client.get(f"/api/v1/assortment/skus?badge={badge}")
        assert response.status_code == 200
        skus = response.json()
        assert len(skus) > 0
        for sku in skus:
            assert sku["status_badge"].upper() == badge


def test_get_scenarios(client):
    response = client.get("/api/v1/assortment/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert data["active_default"] == "balanced"
    scenarios = data["scenarios"]
    assert len(scenarios) == 3
    keys = [s["scenario_key"] for s in scenarios]
    assert "conservative" in keys
    assert "balanced" in keys
    assert "aggressive" in keys

    for s in scenarios:
        assert "action_counts" in s
        assert "GROW" in s["action_counts"]
        assert "MAINTAIN" in s["action_counts"]
        assert "SWAP" in s["action_counts"]
        assert "REDUCE" in s["action_counts"]
        assert s["projected_sales_per_linear_ft"] > 0
        assert s["projected_private_brand_pct"] >= 25.0


def test_submit_assortment_success(client):
    payload = {
        "scenario_key": "balanced",
        "user_id": "mgr_snack_001",
        "justification_note": "Approved quarterly optimization for Small Town Value Cluster",
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["audit_confirmation_id"].startswith("AUD-")
    assert data["scenario_name"] == "Balanced"
    assert data["user_id"] == "mgr_snack_001"
    assert data["guardrail_status"] == "PASSED"
    assert data["summary"]["total_skus_reviewed"] >= 20
    assert data["summary"]["projected_private_brand_pct"] >= 25.0


def test_submit_assortment_invalid_scenario(client):
    payload = {
        "scenario_key": "invalid_scenario",
        "user_id": "mgr_snack_001",
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 400
    assert "invalid scenario" in response.json()["detail"].lower()


def test_submit_assortment_guardrail_failure(client):
    # Test submission when private brand % is below 25.0% guardrail
    from server.tests.conftest import TestingSessionLocal

    session = TestingSessionLocal()
    failing_scenario = ScenarioProjectionModel(
        id=str(uuid.uuid4()),
        scenario_key="failing_scenario",
        display_name="Failing Scenario",
        description="Scenario violating guardrails.",
        projected_sales_per_linear_ft=380.0,
        projected_private_brand_pct=18.0,  # Below 25%
        projected_in_stock_rate_pct=90.0,
        projected_shelf_capacity_pct=80.0,
        action_grow_count=1,
        action_maintain_count=10,
        action_swap_count=5,
        action_reduce_count=6,
    )
    session.add(failing_scenario)
    session.commit()
    session.close()

    payload = {
        "scenario_key": "failing_scenario",
        "user_id": "mgr_snack_001",
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 400
    assert "guardrail check failed" in response.json()["detail"].lower()


def test_get_submissions(client):
    # Submit one first
    client.post(
        "/api/v1/assortment/submit",
        json={"scenario_key": "conservative", "user_id": "mgr_snack_002"},
    )
    response = client.get("/api/v1/assortment/submissions")
    assert response.status_code == 200
    submissions = response.json()
    assert len(submissions) >= 1
    sub = submissions[0]
    assert "audit_confirmation_id" in sub
    assert "audit_trail_json" in sub

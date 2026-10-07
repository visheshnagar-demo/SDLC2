from fastapi.testclient import TestClient


def test_healthz(client: TestClient):
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "DG Cluster Assortment Advisor" in data["service"]


def test_get_kpis(client: TestClient):
    response = client.get("/api/v1/assortment/kpis?cluster_id=small_town_value")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_id"] == "small_town_value"
    assert "Small Town Value" in data["cluster_name"]
    assert data["sales_per_linear_ft"] > 0
    assert "$" in data["sales_per_linear_ft_formatted"]
    assert data["private_brand_percentage"] >= 20.0
    assert "%" in data["private_brand_percentage_formatted"]
    assert data["instock_rate"] >= 90.0
    assert "%" in data["instock_rate_formatted"]
    assert data["shelf_capacity_total_ft"] == 120.0
    assert "Capacity" in data["shelf_capacity_formatted"]


def test_get_skus_all(client: TestClient):
    response = client.get("/api/v1/assortment/skus?cluster_id=small_town_value")
    assert response.status_code == 200
    data = response.json()
    assert data["total_skus"] >= 22
    assert len(data["items"]) >= 22

    # Check structure of first item
    first = data["items"][0]
    assert "sku_code" in first
    assert "product_name" in first
    assert "sales_velocity" in first
    assert "status_badge" in first
    assert first["status_badge"] in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]


def test_get_skus_filtered_by_badge(client: TestClient):
    response = client.get("/api/v1/assortment/skus?badge=GROW")
    assert response.status_code == 200
    data = response.json()
    assert data["total_skus"] == 5
    for item in data["items"]:
        assert item["status_badge"] == "GROW"
        assert item["is_private_brand"] is True


def test_get_skus_filtered_by_subcategory(client: TestClient):
    response = client.get("/api/v1/assortment/skus?sub_category=Popcorn")
    assert response.status_code == 200
    data = response.json()
    assert data["total_skus"] == 2
    for item in data["items"]:
        assert item["sub_category"] == "Popcorn"


def test_scenario_impact_balanced(client: TestClient):
    response = client.post(
        "/api/v1/assortment/scenario-impact",
        json={"cluster_id": "small_town_value", "scenario_key": "balanced"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_key"] == "balanced"
    assert "Balanced" in data["scenario_name"]
    assert data["projected_sales_lift_pct"] == 4.5
    assert data["projected_pb_share_pct"] == 32.5
    assert data["projected_instock_rate_pct"] == 96.5
    assert data["projected_shelf_capacity_pct"] == 99.0
    assert data["can_submit"] is True

    # Check sku action summary
    actions = data["sku_action_summary"]
    assert actions["grow_count"] == 5
    assert actions["maintain_count"] == 12
    assert actions["swap_count"] == 3
    assert actions["reduce_count"] == 2

    # Check guardrails
    assert len(data["guardrails"]) == 3
    for g in data["guardrails"]:
        assert g["status"] == "PASS"


def test_scenario_impact_conservative_and_aggressive(client: TestClient):
    for scen_key in ["conservative", "aggressive"]:
        response = client.post(
            "/api/v1/assortment/scenario-impact",
            json={"cluster_id": "small_town_value", "scenario_key": scen_key},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["scenario_key"] == scen_key
        assert data["can_submit"] is True


def test_submit_approval_success(client: TestClient):
    payload = {
        "cluster_id": "small_town_value",
        "scenario_key": "balanced",
        "manager_user_id": "MGR-DG-8812",
        "manager_email": "category.manager@dollargeneral.com",
        "notes": "Approved Q3 Small Town Value Snacks reset.",
    }
    response = client.post("/api/v1/assortment/approvals", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "approval_id" in data
    assert data["audit_reference_id"].startswith("AUD-")
    assert "-STV-" in data["audit_reference_id"]
    assert data["cluster_id"] == "small_town_value"
    assert data["approved_scenario"] == "Balanced"
    assert data["status"] == "APPROVED"
    assert data["manager_user_id"] == "MGR-DG-8812"
    assert data["manager_email"] == "category.manager@dollargeneral.com"
    assert "grow_count" in data["sku_action_metrics"]
    assert "sales_lift_pct" in data["projected_impact"]
    assert "message" in data


def test_submit_approval_invalid_payload(client: TestClient):
    payload = {
        "cluster_id": "small_town_value",
    }
    response = client.post("/api/v1/assortment/approvals", json=payload)
    assert response.status_code == 422


def test_scenario_impact_not_found(client: TestClient):
    response = client.post(
        "/api/v1/assortment/scenario-impact",
        json={
            "cluster_id": "small_town_value",
            "scenario_key": "non_existent_strategy",
        },
    )
    assert response.status_code == 404

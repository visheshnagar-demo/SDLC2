def test_get_cluster_kpis_success(client):
    """Test retrieving cluster aggregate baseline KPI metrics (Acceptance Criteria 1)."""
    response = client.get("/api/v1/kpis?cluster_code=STV-CLUSTER")
    assert response.status_code == 200
    data = response.json()

    assert "sales_per_linear_foot" in data
    assert "private_brand_percentage" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity" in data
    assert "cluster_code" in data
    assert data["cluster_code"] == "STV-CLUSTER"

    # Business rule sanity checks
    assert data["sales_per_linear_foot"] > 0
    assert data["private_brand_percentage"] >= 0.0
    assert data["in_stock_rate"] >= 90.0
    assert data["shelf_capacity"] > 0.0
    assert data["total_skus_count"] > 0


def test_get_root_and_health(client):
    """Test health check and root endpoints."""
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "DG Cluster Assortment Advisor" in res_root.json()["message"]

    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

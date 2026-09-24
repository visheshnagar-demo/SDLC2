def test_get_kpi_summary(client):
    response = client.get("/api/v1/kpis/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_id"] == "STV-CLUSTER-04"
    assert data["category"] == "Snacks"
    assert "metrics" in data

    metrics = data["metrics"]
    assert metrics["sales_per_linear_foot"] > 0
    assert metrics["private_brand_percentage"] >= 25.0
    assert metrics["in_stock_rate"] >= 95.0
    assert metrics["shelf_capacity_total"] == 1250.0
    assert metrics["shelf_capacity_used"] == 1200.0
    assert metrics["shelf_utilization_percentage"] == 96.0


def test_get_kpi_summary_with_custom_code(client):
    response = client.get("/api/v1/kpis/summary?cluster_code=STV-CLUSTER-04")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_id"] == "STV-CLUSTER-04"

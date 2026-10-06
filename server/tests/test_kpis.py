def test_get_kpis_success(client):
    """Test retrieving KPI header strip data (AC 1)."""
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()

    # Verify key metrics
    assert "sales_per_linear_ft" in data
    assert "private_brand_percentage" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity" in data

    assert data["sales_per_linear_ft"] == 428.50
    assert data["private_brand_percentage"] == 24.5
    assert data["in_stock_rate"] == 96.8

    shelf = data["shelf_capacity"]
    assert shelf["current"] == 142.0
    assert shelf["total"] == 150.0
    assert shelf["unit"] == "LF"


def test_health_check(client):
    """Test health check endpoints."""
    res1 = client.get("/health")
    assert res1.status_code == 200
    assert res1.json()["status"] == "healthy"

    res2 = client.get("/")
    assert res2.status_code == 200
    assert res2.json()["category"] == "Snacks"

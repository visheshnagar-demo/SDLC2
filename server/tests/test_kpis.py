def test_get_cluster_kpis_success(client):
    response = client.get("/api/v1/cluster/kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_id"] == "STV-CLUSTER-01"
    assert data["cluster_name"] == "Small Town Value Cluster"
    assert data["category"] == "Snacks"
    assert data["sales_per_linear_ft"] == 125.0
    assert data["sales_per_linear_ft_formatted"] == "$125.00/ft"
    assert data["private_brand_percentage"] == 32.0
    assert data["in_stock_rate_percentage"] == 96.5
    assert data["shelf_capacity_percentage"] == 88.0
    assert "metrics" in data
    assert data["metrics"]["sales_per_linear_ft"] == 125.0


def test_get_kpis_alias_endpoint(client):
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["cluster_id"] == "STV-CLUSTER-01"


def test_healthcheck_endpoints(client):
    res1 = client.get("/health")
    assert res1.status_code == 200
    assert res1.json()["status"] == "healthy"

    res2 = client.get("/api/v1/health")
    assert res2.status_code == 200
    assert res2.json()["status"] == "healthy"

    root_res = client.get("/")
    assert root_res.status_code == 200
    assert root_res.json()["status"] == "online"

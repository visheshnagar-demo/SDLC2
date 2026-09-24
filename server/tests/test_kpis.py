import pytest
from fastapi.testclient import TestClient
from server.database import DEFAULT_CLUSTER_ID


def test_get_cluster_kpis_success(client: TestClient):
    response = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/kpis")
    assert response.status_code == 200
    data = response.json()

    assert data["cluster_id"] == DEFAULT_CLUSTER_ID
    assert data["cluster_name"] == "Small Town Value Cluster"
    assert data["category"] == "Snacks"
    assert "last_updated" in data

    kpis = data["kpis"]
    assert "sales_per_linear_foot" in kpis
    assert "private_brand_percentage" in kpis
    assert "in_stock_rate_percentage" in kpis
    assert "shelf_capacity_utilization_percentage" in kpis

    assert kpis["sales_per_linear_foot"] > 0
    assert 0 <= kpis["private_brand_percentage"] <= 100
    assert 0 <= kpis["in_stock_rate_percentage"] <= 100
    assert 0 <= kpis["shelf_capacity_utilization_percentage"] <= 100


def test_get_cluster_kpis_not_found(client: TestClient):
    response = client.get("/api/v1/clusters/non-existent-cluster-id/kpis")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data

import pytest
from fastapi.testclient import TestClient
from server.database import DEFAULT_CLUSTER_ID


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

    api_resp = client.get("/api/v1/health")
    assert api_resp.status_code == 200
    assert api_resp.json()["service"] == "dg-cluster-assortment-advisor-api"


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs_url" in data


def test_get_all_clusters(client: TestClient):
    response = client.get("/api/v1/clusters")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] >= 1
    cluster_names = [c["name"] for c in data["items"]]
    assert "Small Town Value Cluster" in cluster_names


def test_get_default_cluster(client: TestClient):
    response = client.get("/api/v1/clusters/default")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == DEFAULT_CLUSTER_ID
    assert data["name"] == "Small Town Value Cluster"
    assert data["category"] == "Snacks"
    assert data["total_linear_feet"] > 0


def test_get_cluster_by_id(client: TestClient):
    response = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == DEFAULT_CLUSTER_ID
    assert data["code"] == "STV-SNACKS-01"


def test_get_cluster_not_found(client: TestClient):
    response = client.get("/api/v1/clusters/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data

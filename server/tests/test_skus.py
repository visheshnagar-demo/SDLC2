import pytest
from fastapi.testclient import TestClient
from server.database import DEFAULT_CLUSTER_ID


def test_list_skus_success(client: TestClient):
    response = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/skus")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] > 0

    first_item = data["items"][0]
    assert "sku_code" in first_item
    assert "product_name" in first_item
    assert "brand_name" in first_item
    assert "status_badge" in first_item
    assert first_item["status_badge"] in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]
    assert "sales_per_linear_ft" in first_item
    assert "linear_feet_allocated" in first_item
    assert "in_stock_rate" in first_item
    assert "is_private_brand" in first_item


def test_filter_skus_by_status_badge(client: TestClient):
    for badge in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]:
        response = client.get(
            f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/skus?status_badge={badge}"
        )
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["status_badge"] == badge


def test_filter_skus_by_subcategory(client: TestClient):
    response = client.get(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/skus?sub_category=Chips"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert item["sub_category"].lower() == "chips"


def test_filter_skus_by_private_brand(client: TestClient):
    pb_resp = client.get(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/skus?is_private_brand=true"
    )
    assert pb_resp.status_code == 200
    pb_data = pb_resp.json()
    assert pb_data["total"] > 0
    for item in pb_data["items"]:
        assert item["is_private_brand"] is True

    nb_resp = client.get(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/skus?is_private_brand=false"
    )
    assert nb_resp.status_code == 200
    nb_data = nb_resp.json()
    assert nb_data["total"] > 0
    for item in nb_data["items"]:
        assert item["is_private_brand"] is False


def test_search_skus(client: TestClient):
    response = client.get(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/skus?search=Clover"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert "clover" in item["product_name"].lower() or "clover" in item["brand_name"].lower()


def test_skus_pagination(client: TestClient):
    response = client.get(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/skus?skip=0&limit=3"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 3


def test_skus_cluster_not_found(client: TestClient):
    response = client.get("/api/v1/clusters/non-existent-cluster/skus")
    assert response.status_code == 404

def test_get_skus_all(client):
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] >= 20
    assert len(data["items"]) == data["total"]

    first_item = data["items"][0]
    assert "sku_number" in first_item
    assert "name" in first_item
    assert "brand" in first_item
    assert "is_private_brand" in first_item
    assert "status_badge" in first_item
    assert first_item["status_badge"] in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]


def test_filter_skus_by_status(client):
    for status in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]:
        response = client.get(f"/api/v1/skus?status={status}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] > 0
        for item in data["items"]:
            assert item["status_badge"] == status


def test_filter_skus_by_private_brand(client):
    response = client.get("/api/v1/skus?is_private_brand=true")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert item["is_private_brand"] is True


def test_search_skus(client):
    response = client.get("/api/v1/skus?search=Potato")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("Potato" in item["name"] for item in data["items"])

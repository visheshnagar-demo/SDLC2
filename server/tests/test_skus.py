def test_get_all_skus_default(client):
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 12
    assert len(data["skus"]) == 12
    first_sku = data["skus"][0]
    assert "sku_code" in first_sku
    assert "name" in first_sku
    assert "brand_type" in first_sku
    assert "weekly_sales_units" in first_sku
    assert "margin_percentage" in first_sku
    assert "recommended_action" in first_sku
    assert "status_badge_color" in first_sku


def test_filter_skus_by_brand_type(client):
    # Filter by PRIVATE_BRAND
    pb_res = client.get("/api/v1/skus?brand_type=PRIVATE_BRAND")
    assert pb_res.status_code == 200
    pb_data = pb_res.json()
    assert pb_data["total_count"] == 4
    for item in pb_data["skus"]:
        assert item["brand_type"] == "PRIVATE_BRAND"

    # Filter by NATIONAL_BRAND
    nat_res = client.get("/api/v1/skus?brand_type=NATIONAL_BRAND")
    assert nat_res.status_code == 200
    nat_data = nat_res.json()
    assert nat_data["total_count"] == 8
    for item in nat_data["skus"]:
        assert item["brand_type"] == "NATIONAL_BRAND"


def test_filter_skus_by_action(client):
    # Test GROW filter
    res = client.get("/api/v1/skus?action=GROW")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 3
    for s in data["skus"]:
        assert s["recommended_action"] == "GROW"

    # Test REDUCE filter
    res_reduce = client.get("/api/v1/skus?action=REDUCE")
    assert res_reduce.status_code == 200
    reduce_data = res_reduce.json()
    assert reduce_data["total_count"] == 2
    for s in reduce_data["skus"]:
        assert s["recommended_action"] == "REDUCE"


def test_search_skus(client):
    res = client.get("/api/v1/skus?search=Potato")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 2
    for s in data["skus"]:
        assert "potato" in s["name"].lower() or "potato" in s["sku_code"].lower()


def test_pagination_skus(client):
    res = client.get("/api/v1/skus?skip=0&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 12
    assert len(data["skus"]) == 5

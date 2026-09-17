def test_get_skus_list_with_badges(client):
    """Test retrieving SKU list with directive badges (Acceptance Criteria 2)."""
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()

    assert "items" in data
    assert "total" in data
    assert data["total"] > 0

    items = data["items"]
    badges_found = {sku["status_badge"] for sku in items}

    # Verify presence of directive badges
    expected_badges = {"GROW", "MAINTAIN", "SWAP", "REDUCE"}
    assert expected_badges.issubset(badges_found)

    # Check structure of single SKU item
    first_sku = items[0]
    assert "sku_code" in first_sku
    assert "name" in first_sku
    assert "subcategory" in first_sku
    assert "brand_tier" in first_sku
    assert "sales_per_lin_ft" in first_sku
    assert "margin_pct" in first_sku
    assert "weekly_unit_velocity" in first_sku
    assert "in_stock_pct" in first_sku
    assert "shelf_linear_ft" in first_sku


def test_filter_skus_by_subcategory_and_badge(client):
    """Test filtering SKU list by subcategory and status badge."""
    # Subcategory filter
    res_sub = client.get("/api/v1/skus?subcategory=Salty%20Snacks")
    assert res_sub.status_code == 200
    items_sub = res_sub.json()["items"]
    assert len(items_sub) > 0
    assert all(sku["subcategory"] == "Salty Snacks" for sku in items_sub)

    # Status badge filter
    res_badge = client.get("/api/v1/skus?status_badge=GROW")
    assert res_badge.status_code == 200
    items_badge = res_badge.json()["items"]
    assert len(items_badge) > 0
    assert all(sku["status_badge"] == "GROW" for sku in items_badge)


def test_search_skus(client):
    """Test searching SKUs by name or code."""
    response = client.get("/api/v1/skus?search=Clover%20Valley")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) > 0
    assert all(
        "Clover Valley" in sku["name"] or "Clover Valley" in sku["brand_tier"]
        for sku in items
    )


def test_get_and_patch_sku(client):
    """Test retrieving and updating SKU status badge."""
    res_list = client.get("/api/v1/skus")
    sku_id = res_list.json()["items"][0]["id"]

    res_single = client.get(f"/api/v1/skus/{sku_id}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == sku_id

    # Update badge
    res_patch = client.patch(f"/api/v1/skus/{sku_id}", json={"status_badge": "SWAP"})
    assert res_patch.status_code == 200
    assert res_patch.json()["status_badge"] == "SWAP"

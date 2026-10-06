def test_get_skus_list(client):
    """Test retrieving list of Snacks SKUs with performance metrics (AC 2)."""
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    skus = response.json()
    assert isinstance(skus, list)
    assert len(skus) >= 5

    sku_ids = [s["sku_id"] for s in skus]
    assert "SKU-10842" in sku_ids
    assert "SKU-20911" in sku_ids
    assert "SKU-30124" in sku_ids
    assert "SKU-40582" in sku_ids
    assert "SKU-50912" in sku_ids

    # Verify first item fields
    item = next(s for s in skus if s["sku_id"] == "SKU-10842")
    assert item["name"] == "DG Clover Valley Potato Chips 10oz"
    assert item["sales"] == 14250.0
    assert item["movement"] == 4200
    assert item["margin_percentage"] == 38.5
    assert item["velocity"] == 1.8
    assert item["recommended_action"] == "GROW"
    assert item["action"] == "GROW"


def test_get_skus_filtered_by_action(client):
    """Test filtering SKUs by action recommendation (AC 2)."""
    response = client.get("/api/v1/skus?action=GROW")
    assert response.status_code == 200
    skus = response.json()
    assert len(skus) >= 2
    for s in skus:
        assert s["recommended_action"] == "GROW"


def test_get_sku_by_id(client):
    """Test retrieving a specific SKU."""
    response = client.get("/api/v1/skus/SKU-20911")
    assert response.status_code == 200
    sku = response.json()
    assert sku["sku_id"] == "SKU-20911"
    assert sku["recommended_action"] == "SWAP"


def test_get_sku_not_found(client):
    """Test 404 for non-existent SKU."""
    response = client.get("/api/v1/skus/SKU-NONEXISTENT")
    assert response.status_code == 404


def test_create_sku(client):
    """Test creating a new SKU."""
    new_sku = {
        "sku_id": "SKU-99999",
        "name": "DG Gourmet Popcorn 8oz",
        "category": "Snacks",
        "sales": 5500.0,
        "movement": 1200,
        "margin_percentage": 42.0,
        "velocity": 1.2,
        "recommended_action": "GROW",
    }
    response = client.post("/api/v1/skus", json=new_sku)
    assert response.status_code == 201
    created = response.json()
    assert created["sku_id"] == "SKU-99999"
    assert created["name"] == "DG Gourmet Popcorn 8oz"

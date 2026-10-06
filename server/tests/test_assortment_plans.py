def test_submit_assortment_plan_success(client):
    """Test submitting an assortment plan and generating an audit trail (AC 4, AC 5)."""
    payload = {
        "scenario_type": "Balanced",
        "user_id": "Marcus Vance",
        "cluster_id": "STV-042",
        "sku_actions": [
            {"sku_id": "SKU-10842", "action": "GROW"},
            {"sku_id": "SKU-20911", "action": "SWAP"},
            {"sku_id": "SKU-30124", "action": "MAINTAIN"},
            {"sku_id": "SKU-40582", "action": "REDUCE"},
            {"sku_id": "SKU-50912", "action": "GROW"},
        ],
    }
    response = client.post("/api/v1/assortment-plans/submit", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "audit_id" in data
    assert data["audit_id"].startswith("AT-") or data["audit_id"].startswith("#AT-")
    assert data["user_id"] == "Marcus Vance"
    assert data["cluster_id"] == "STV-042"
    assert data["scenario_selected"] == "Balanced"
    assert data["status"] == "SUBMITTED"

    assert "sku_action_summary" in data
    assert "guardrail_status" in data
    assert "message" in data
    assert "AT-" in data["message"]

    audit_id = data["audit_id"]

    # Retrieve by audit ID
    get_res = client.get(f"/api/v1/assortment-plans/{audit_id}")
    assert get_res.status_code == 200
    plan = get_res.json()
    assert plan["audit_id"] == audit_id
    assert plan["user_id"] == "Marcus Vance"


def test_get_assortment_plans_list(client):
    """Test listing submitted assortment plans."""
    # Submit one plan first
    client.post(
        "/api/v1/assortment-plans/submit",
        json={"scenario_type": "Aggressive", "user_id": "Marcus Vance"},
    )
    response = client.get("/api/v1/assortment-plans")
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) >= 1
    assert plans[0]["scenario_selected"] in ["Balanced", "Aggressive", "Conservative"]

def test_submit_assortment_plan_success(client):
    """Test submitting assortment plan and generating immutable audit trail (Acceptance Criteria 4 & 5)."""
    payload = {
        "scenario_code": "balanced",
        "cluster_code": "STV-CLUSTER",
        "submitted_by": "Category Manager Snacks",
        "notes": "Q3 Small Town Value assortment reset",
    }
    response = client.post("/api/v1/assortment-plans/submit", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert "audit_id" in data
    assert data["audit_id"].startswith("AUD-2026-")
    assert data["status"] == "APPROVED"
    assert data["guardrail_status"] == "ALL_PASSED"
    assert data["submitted_by"] == "Category Manager Snacks"
    assert data["total_sku_actions"] > 0
    assert "timestamp" in data

    # Verify audit trail summary
    audit_trail = data["audit_trail_summary"]
    assert audit_trail is not None
    assert audit_trail["audit_id"] == data["audit_id"]
    assert audit_trail["scenario_code"] == "balanced"
    assert audit_trail["cluster_code"] == "STV-CLUSTER"
    assert "timestamp" in audit_trail
    assert len(audit_trail["actions"]) > 0


def test_get_assortment_plan_by_audit_id(client):
    """Test retrieving submitted plan by audit ID (Acceptance Criteria 5)."""
    # First submit a plan
    submit_res = client.post(
        "/api/v1/assortment-plans/submit",
        json={
            "scenario_code": "conservative",
            "cluster_code": "STV-CLUSTER",
            "submitted_by": "Senior CM",
        },
    )
    assert submit_res.status_code == 201
    audit_id = submit_res.json()["audit_id"]

    # Fetch by audit_id
    get_res = client.get(f"/api/v1/assortment-plans/{audit_id}")
    assert get_res.status_code == 200
    plan_data = get_res.json()

    assert plan_data["audit_id"] == audit_id
    assert plan_data["submitted_by"] == "Senior CM"
    assert plan_data["audit_trail_summary"]["audit_id"] == audit_id
    assert plan_data["audit_trail_summary"]["scenario_code"] == "conservative"


def test_get_nonexistent_plan(client):
    """Test 404 for nonexistent audit ID."""
    response = client.get("/api/v1/assortment-plans/AUD-9999-00000")
    assert response.status_code == 404

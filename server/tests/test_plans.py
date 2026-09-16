def test_submit_assortment_plan_success(client):
    payload = {
        "cluster_id": "STV-CLUSTER-01",
        "scenario_type": "BALANCED",
        "submitted_by": "category_manager_dg@example.com",
        "notes": "Q2 Snacks Assortment Optimization for Small Town Value Cluster",
    }
    response = client.post("/api/v1/plans/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "audit_id" in data
    assert data["audit_id"].startswith("AUD-")
    assert "submission_id" in data
    assert data["status"] == "SUBMITTED"
    assert data["cluster_id"] == "STV-CLUSTER-01"
    assert data["scenario_type"] == "BALANCED"
    assert data["sku_actions_committed"] == 12
    assert "guardrail_summary" in data
    assert "PASSED" in data["guardrail_summary"]
    assert "confirmation_message" in data

    # Test audit lookup by returned audit_id
    audit_id = data["audit_id"]
    audit_res = client.get(f"/api/v1/plans/audit/{audit_id}")
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data["audit_id"] == audit_id
    assert audit_data["plan_id"] == data["submission_id"]
    assert audit_data["scenario_type"] == "BALANCED"
    assert len(audit_data["actions"]) == 12
    assert len(audit_data["guardrail_checks"]) == 3


def test_submit_plan_invalid_scenario(client):
    payload = {
        "cluster_id": "STV-CLUSTER-01",
        "scenario_type": "INVALID_TYPE",
        "submitted_by": "category_manager_dg@example.com",
    }
    response = client.post("/api/v1/plans/submit", json=payload)
    assert response.status_code == 422


def test_get_nonexistent_audit_record(client):
    response = client.get("/api/v1/plans/audit/AUD-9999-00000")
    assert response.status_code == 404

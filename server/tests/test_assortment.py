def test_submit_assortment_plan_balanced(client):
    payload = {
        "cluster_id": "STV-CLUSTER-04",
        "category": "Snacks",
        "scenario_id": "balanced",
        "submitted_by": "category.manager@dollargeneral.com",
        "notes": "Q2 Snacks Assortment Refresh for Small Town Value Cluster",
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "submission_id" in data
    assert data["submission_id"].startswith("AUD-2026-")
    assert data["status"] == "APPROVED"
    assert data["scenario_selected"] == "Balanced"
    assert data["category"] == "Snacks"
    assert "sku_action_summary" in data
    assert data["sku_action_summary"]["grow_count"] == 5
    assert data["sku_action_summary"]["maintain_count"] == 12
    assert "guardrail_results" in data
    assert len(data["guardrail_results"]) == 3
    for guardrail in data["guardrail_results"]:
        assert guardrail["passed"] is True
    assert "audit_trail_message" in data
    assert data["submission_id"] in data["audit_trail_message"]


def test_submit_assortment_plan_invalid_scenario(client):
    payload = {
        "cluster_id": "STV-CLUSTER-04",
        "category": "Snacks",
        "scenario_id": "invalid_scenario_xyz",
        "submitted_by": "category.manager@dollargeneral.com",
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 400
    assert "Invalid scenario" in response.json()["detail"]


def test_get_audit_logs(client):
    # First submit a plan
    payload = {
        "cluster_id": "STV-CLUSTER-04",
        "category": "Snacks",
        "scenario_id": "conservative",
        "submitted_by": "category.manager@dollargeneral.com",
    }
    submit_res = client.post("/api/v1/assortment/submit", json=payload)
    assert submit_res.status_code == 201
    submission_id = submit_res.json()["submission_id"]

    # Then retrieve audit logs
    logs_res = client.get("/api/v1/assortment/audit-logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 1
    assert any(log["payload"].get("submission_id") == submission_id for log in logs)

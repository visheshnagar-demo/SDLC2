import pytest
from fastapi.testclient import TestClient
from server.database import DEFAULT_CLUSTER_ID


def test_create_and_fetch_submission(client: TestClient):
    # 1. Fetch scenarios first to get valid scenario_id
    scenarios_resp = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/scenarios")
    assert scenarios_resp.status_code == 200
    scenarios = scenarios_resp.json()["scenarios"]
    balanced_sc = next(s for s in scenarios if s["scenario_type"] == "BALANCED")

    # 2. Submit recommendation
    payload = {
        "scenario_id": balanced_sc["id"],
        "scenario_type": "BALANCED",
        "submitted_by_user": "catman.snacks@dollargeneral.local",
        "notes": "Approved Q3 Snacks assortment optimization plan.",
    }
    response = client.post(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/submissions",
        json=payload,
    )
    assert response.status_code == 201
    data = response.json()

    assert "submission_id" in data
    assert "audit_reference" in data
    assert data["audit_reference"].startswith("AUD-")
    assert data["cluster_id"] == DEFAULT_CLUSTER_ID
    assert data["scenario_type"] == "BALANCED"
    assert data["submitted_by"] == "catman.snacks@dollargeneral.local"
    assert data["guardrail_status"] == "PASSED"
    assert data["status"] == "CONFIRMED"
    assert data["checksum"] is not None
    assert data["checksum"].startswith("sha256:")

    summary = data["sku_action_summary"]
    assert summary["adds"] == 5
    assert summary["keeps"] == 30
    assert summary["swaps"] == 5
    assert summary["removes"] == 2

    # 3. Fetch list of submissions
    list_resp = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/submissions")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total"] >= 1
    found = any(s["submission_id"] == data["submission_id"] for s in list_data["items"])
    assert found is True

    # 4. Fetch single submission
    single_resp = client.get(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/submissions/{data['submission_id']}"
    )
    assert single_resp.status_code == 200
    single_data = single_resp.json()
    assert single_data["submission_id"] == data["submission_id"]
    assert single_data["audit_reference"] == data["audit_reference"]


def test_create_submission_aggressive_warning(client: TestClient):
    scenarios_resp = client.get(f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/scenarios")
    assert scenarios_resp.status_code == 200
    scenarios = scenarios_resp.json()["scenarios"]
    aggressive_sc = next(s for s in scenarios if s["scenario_type"] == "AGGRESSIVE")

    payload = {
        "scenario_id": aggressive_sc["id"],
        "scenario_type": "AGGRESSIVE",
        "submitted_by_user": "catman.snacks@dollargeneral.local",
        "notes": "Testing aggressive assortment scenario submission.",
    }
    response = client.post(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/submissions",
        json=payload,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["guardrail_status"] == "WARNING"
    assert data["sku_action_summary"]["adds"] == 9


def test_create_submission_invalid_cluster(client: TestClient):
    payload = {
        "scenario_id": "7a1b2c3d-0002-4000-8000-000000000002",
        "scenario_type": "BALANCED",
        "submitted_by_user": "tester@example.com",
    }
    response = client.post(
        "/api/v1/clusters/non-existent-cluster-id/submissions",
        json=payload,
    )
    assert response.status_code == 404


def test_create_submission_invalid_scenario(client: TestClient):
    payload = {
        "scenario_id": "00000000-0000-0000-0000-000000000000",
        "scenario_type": "BALANCED",
        "submitted_by_user": "tester@example.com",
    }
    response = client.post(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/submissions",
        json=payload,
    )
    assert response.status_code == 404


def test_get_submission_not_found(client: TestClient):
    response = client.get(
        f"/api/v1/clusters/{DEFAULT_CLUSTER_ID}/submissions/non-existent-id"
    )
    assert response.status_code == 404

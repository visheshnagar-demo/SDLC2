from fastapi.testclient import TestClient


def test_dashboard_metrics_and_audit_trail(client: TestClient):
    # 1. Create a submission
    payload = {
        "cedingCompanyName": "Zurich",
        "insuredName": "Quantum AI Labs",
        "lineOfBusiness": "Cyber Risk",
        "policyLimit": 3000000.0,
        "attachmentPoint": 1000000.0,
        "retention": 100000.0,
        "grossPremium": 80000.0,
        "effectiveDate": "2026-12-01",
        "expiryDate": "2027-12-01",
        "industry": "Artificial Intelligence",
        "revenueBand": "$10M - $25M",
        "jurisdiction": "US-WA",
    }

    sub_res = client.post("/api/v1/submissions", json=payload)
    assert sub_res.status_code == 201
    sub_id = sub_res.json()["id"]

    # 2. Check Audit Trail
    audit_res = client.get(f"/api/v1/submissions/{sub_id}/audit-trail")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 1
    assert any(log["actionType"] == "SUBMISSION_CREATED" for log in logs)

    # 3. Check Dashboard Metrics
    dash_res = client.get("/api/v1/dashboard/metrics")
    assert dash_res.status_code == 200
    metrics = dash_res.json()
    assert metrics["totalSubmissions"] >= 1
    assert "Cyber Risk" in metrics["submissionsByLine"]
    assert "Cyber Risk" in metrics["totalExposedLimitByLine"]


def test_config_endpoints(client: TestClient):
    # Scoring rules
    rules_res = client.get("/api/v1/config/scoring-rules")
    assert rules_res.status_code == 200
    rules_data = rules_res.json()
    assert "cyberWeights" in rules_data
    assert "doWeights" in rules_data

    # Authorities
    auth_res = client.get("/api/v1/config/authorities")
    assert auth_res.status_code == 200
    auth_data = auth_res.json()
    assert len(auth_data) >= 1

def test_health_checks(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    res_api = client.get("/api/v1/health")
    assert res_api.status_code == 200
    assert res_api.json()["status"] == "ok"


def test_auth_login_and_me(client, carrier_headers):
    # Test valid login
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

    # Test invalid login
    res_bad = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert res_bad.status_code == 401

    # Test /auth/me
    res_me = client.get("/api/v1/auth/me", headers=carrier_headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "test@example.com"


def test_decline_reasons_endpoint(client):
    res1 = client.get("/api/v1/submissions/decline-reasons")
    assert res1.status_code == 200
    reasons1 = res1.json()
    assert isinstance(reasons1, list)
    codes = [r["code"] for r in reasons1]
    assert "HIGH_EXPOSURE_AGGREGATION" in codes
    assert "UNSATISFACTORY_LOSS_HISTORY" in codes

    res2 = client.get("/api/v1/decline-reasons")
    assert res2.status_code == 200
    assert len(res2.json()) == len(reasons1)


def test_carrier_submit_cyber_request(client, carrier_headers):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Apex Cloud Systems Inc",
        "industry_segment": "Technology",
        "annual_revenue": 75000000.0,
        "sum_insured": 15000000.0,
        "attachment_point": 1000000.0,
        "policy_start_date": "2026-07-01",
        "policy_end_date": "2027-07-01",
        "prior_claims_count": 1,
        "prior_claims_total": 250000.0,
        "security_governance_score": 85.0,
        "notes": "Facultative quota share layer request.",
    }
    res = client.post("/api/v1/submissions", json=payload, headers=carrier_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["insured_name"] == "Apex Cloud Systems Inc"
    assert data["risk_type"] == "CYBER"
    assert "submission_reference" in data
    assert data["submission_reference"].startswith("FAC-CYBER-")
    assert data["status"] == "SUBMITTED"
    assert isinstance(data["risk_score"], (int, float))
    assert data["risk_tier"] in ["LOW", "MEDIUM", "HIGH"]
    assert len(data["score_breakdowns"]) > 0

    # Retrieve submission by id
    sub_id = data["id"]
    res_get = client.get(f"/api/v1/submissions/{sub_id}", headers=carrier_headers)
    assert res_get.status_code == 200
    assert res_get.json()["id"] == sub_id


def test_carrier_submit_dno_request(client, carrier_headers):
    payload = {
        "risk_type": "D_AND_O",
        "insured_name": "BioGenesis Therapeutics Ltd",
        "industry_segment": "Biotechnology",
        "annual_revenue": 650000000.0,
        "sum_insured": 30000000.0,
        "attachment_point": 500000.0,
        "policy_start_date": "2026-08-01",
        "policy_end_date": "2027-08-01",
        "prior_claims_count": 3,
        "prior_claims_total": 4500000.0,
        "notes": "High limits excess D&O.",
    }
    res = client.post("/api/v1/submissions", json=payload, headers=carrier_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["risk_type"] == "D_AND_O"
    assert data["risk_tier"] == "HIGH"
    assert data["risk_score"] >= 70.0


def test_submission_attachment_upload(client, carrier_headers):
    # First create a submission
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Nordic Retailers Corp",
        "industry_segment": "Retail",
        "annual_revenue": 45000000.0,
        "sum_insured": 5000000.0,
        "attachment_point": 250000.0,
        "policy_start_date": "2026-09-01",
        "policy_end_date": "2027-09-01",
        "prior_claims_count": 1,
        "prior_claims_total": 120000.0,
    }
    create_res = client.post(
        "/api/v1/submissions", json=payload, headers=carrier_headers
    )
    sub_id = create_res.json()["id"]

    # Check that missing flags flagged loss runs
    detail_res = client.get(f"/api/v1/submissions/{sub_id}", headers=carrier_headers)
    flags = detail_res.json()["missing_flags"]
    assert any("loss_runs" in f["field_name"] for f in flags)

    # Upload attachment via JSON
    att_payload = {
        "file_name": "5_year_loss_runs.pdf",
        "file_type": "application/pdf",
        "file_size": 1048576,
        "file_path": "/uploads/loss_runs.pdf",
        "document_category": "LOSS_RUNS",
    }
    att_res = client.post(
        f"/api/v1/submissions/{sub_id}/attachments",
        json=att_payload,
        headers=carrier_headers,
    )
    assert att_res.status_code == 201
    att_data = att_res.json()
    assert att_data["document_category"] == "LOSS_RUNS"

    # List attachments
    list_att = client.get(
        f"/api/v1/submissions/{sub_id}/attachments", headers=carrier_headers
    )
    assert list_att.status_code == 200
    assert len(list_att.json()) == 1


def test_update_submission(client, carrier_headers):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Draft Tech Corp",
        "industry_segment": "Technology",
        "annual_revenue": 10000000.0,
        "sum_insured": 2000000.0,
        "attachment_point": 100000.0,
        "policy_start_date": "2026-07-01",
        "policy_end_date": "2027-07-01",
        "prior_claims_count": 0,
        "prior_claims_total": 0.0,
    }
    create_res = client.post(
        "/api/v1/submissions", json=payload, headers=carrier_headers
    )
    sub_id = create_res.json()["id"]

    update_payload = {
        "sum_insured": 4000000.0,
        "security_governance_score": 90.0,
    }
    up_res = client.put(
        f"/api/v1/submissions/{sub_id}", json=update_payload, headers=carrier_headers
    )
    assert up_res.status_code == 200
    assert up_res.json()["sum_insured"] == 4000000.0
    assert up_res.json()["security_governance_score"] == 90.0

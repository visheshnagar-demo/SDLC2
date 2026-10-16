from fastapi.testclient import TestClient


def test_carrier_profile_endpoints(client: TestClient):
    # 1. Create new carrier
    resp = client.post(
        "/api/v1/carriers",
        json={
            "carrier_name": "Test Global Reinsurance Ltd",
            "am_best_rating": "A++",
            "contact_email": "reinsurance@testglobal.com",
            "contact_phone": "+1-800-555-0100",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["carrier_name"] == "Test Global Reinsurance Ltd"
    carrier_id = data["id"]

    # 2. Duplicate carrier name
    dup_resp = client.post(
        "/api/v1/carriers",
        json={
            "carrier_name": "Test Global Reinsurance Ltd",
            "am_best_rating": "A",
            "contact_email": "dup@test.com",
        },
    )
    assert dup_resp.status_code == 400

    # 3. Retrieve carrier
    get_resp = client.get(f"/api/v1/carriers/{carrier_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == carrier_id

    # 4. List carriers
    list_resp = client.get("/api/v1/carriers")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1


def test_create_cyber_submission(client: TestClient):
    # Use pre-seeded carrier
    carrier_resp = client.get("/api/v1/carriers")
    assert carrier_resp.status_code == 200
    carriers = carrier_resp.json()
    carrier_id = carriers[0]["id"]

    submission_payload = {
        "carrier_id": carrier_id,
        "risk_type": "CYBER",
        "insured_name": "CloudSecure Networks Inc",
        "industry_sector": "Technology",
        "annual_revenue": 50000000.0,
        "employee_count": 450,
        "limit_requested": 5000000.0,
        "attachment_point": 2000000.0,
        "retention": 500000.0,
        "effective_date": "2026-08-01",
        "expiry_date": "2027-08-01",
        "prior_loss_count": 0,
        "prior_loss_total": 0.0,
        "risk_attributes": {
            "mfa_enabled": True,
            "edr_deployed": True,
            "backup_frequency": "DAILY_IMMUTABLE",
            "encryption_at_rest": True,
            "past_breaches": 0,
        },
        "notes": "Fast-track Cyber placement request.",
    }

    resp = client.post("/api/v1/submissions", json=submission_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["insured_name"] == "CloudSecure Networks Inc"
    assert data["risk_type"] == "CYBER"
    assert data["status"] == "SUBMITTED"
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_tier"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    sub_id = data["id"]

    # Retrieve submission details
    get_sub = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_sub.status_code == 200
    assert get_sub.json()["id"] == sub_id
    assert len(get_sub.json()["missing_flags"]) > 0  # Requires document flags


def test_create_d_and_o_submission(client: TestClient):
    carrier_resp = client.get("/api/v1/carriers")
    carrier_id = carrier_resp.json()[0]["id"]

    d_and_o_payload = {
        "carrier_id": carrier_id,
        "risk_type": "D_AND_O",
        "insured_name": "Apex Biotech Holdings",
        "industry_sector": "Biotechnology",
        "annual_revenue": 200000000.0,
        "employee_count": 800,
        "limit_requested": 15000000.0,
        "attachment_point": 10000000.0,
        "retention": 2500000.0,
        "effective_date": "2026-09-01",
        "expiry_date": "2027-09-01",
        "prior_loss_count": 2,
        "prior_loss_total": 1200000.0,
        "risk_attributes": {
            "public_company": True,
            "pending_litigation": False,
            "board_experience_years": 8,
            "debt_to_equity_ratio": 1.2,
        },
        "notes": "Excess D&O facultative placement.",
    }

    resp = client.post("/api/v1/submissions", json=d_and_o_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["risk_type"] == "D_AND_O"
    assert data["insured_name"] == "Apex Biotech Holdings"


def test_create_submission_validations(client: TestClient):
    # Non-existent carrier
    resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": "non-existent-carrier-uuid",
            "risk_type": "CYBER",
            "insured_name": "Invalid Inc",
            "limit_requested": 1000000,
            "attachment_point": 500000,
            "retention": 100000,
            "effective_date": "2026-01-01",
            "expiry_date": "2027-01-01",
        },
    )
    assert resp.status_code == 404

    # Invalid risk type
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]
    resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "PROPERTY",
            "insured_name": "Invalid Line Inc",
            "limit_requested": 1000000,
            "attachment_point": 500000,
            "retention": 100000,
            "effective_date": "2026-01-01",
            "expiry_date": "2027-01-01",
        },
    )
    assert resp.status_code == 422


def test_attachment_upload_and_listing(client: TestClient):
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]
    sub_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "CYBER",
            "insured_name": "Alpha Defense Systems",
            "limit_requested": 5000000.0,
            "attachment_point": 2000000.0,
            "retention": 500000.0,
            "effective_date": "2026-01-01",
            "expiry_date": "2027-01-01",
        },
    )
    sub_id = sub_resp.json()["id"]

    # Upload attachment
    att_resp = client.post(
        f"/api/v1/submissions/{sub_id}/attachments",
        json={"document_type": "LOSS_RUN", "file_name": "alpha_5yr_loss_runs.pdf"},
    )
    assert att_resp.status_code == 201
    assert att_resp.json()["file_name"] == "alpha_5yr_loss_runs.pdf"

    # List attachments
    list_att = client.get(f"/api/v1/submissions/{sub_id}/attachments")
    assert list_att.status_code == 200
    assert len(list_att.json()) == 1

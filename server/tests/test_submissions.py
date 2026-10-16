import io
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    response_v1 = client.get("/api/v1/health")
    assert response_v1.status_code == 200
    assert response_v1.json()["status"] == "ok"


def test_auth_login_and_me(client: TestClient):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["role"] == "carrier"

    token = data["access_token"]
    me_resp = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "test@example.com"


def test_auth_login_invalid(client: TestClient):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert login_resp.status_code == 401


def test_auth_register(client: TestClient):
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new_carrier@example.com",
            "password": "securepassword123",
            "full_name": "New Carrier Partner",
            "role": "carrier",
            "company_name": "Atlas Underwriters",
        },
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert data["user"]["email"] == "new_carrier@example.com"


def test_create_cyber_submission(client: TestClient, carrier_headers: dict):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "CyberTech Global LLC",
        "industry_segment": "Technology",
        "annual_revenue": 120000000.0,
        "sum_insured": 10000000.0,
        "attachment_point": 2000000.0,
        "policy_start_date": "2026-07-01",
        "policy_end_date": "2027-07-01",
        "prior_claims_count": 1,
        "prior_claims_total": 150000.0,
        "security_governance_score": 85.0,
        "is_final_submission": True,
    }
    response = client.post("/api/v1/submissions", json=payload, headers=carrier_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUBMITTED"
    assert data["insured_name"] == "CyberTech Global LLC"
    assert data["risk_type"] == "CYBER"
    assert data["risk_score"] is not None
    assert data["risk_tier"] in ["LOW", "MEDIUM", "HIGH"]
    assert "submission_reference" in data
    assert data["submission_reference"].startswith("FAC-")


def test_create_dno_submission(client: TestClient, carrier_headers: dict):
    payload = {
        "risk_type": "D_AND_O",
        "insured_name": "BioHealth Pharma Corp",
        "industry_segment": "Healthcare",
        "annual_revenue": 95000000.0,
        "sum_insured": 5000000.0,
        "attachment_point": 2500000.0,
        "policy_start_date": "2026-08-01",
        "policy_end_date": "2027-08-01",
        "prior_claims_count": 0,
        "prior_claims_total": 0.0,
        "security_governance_score": 92.0,
        "is_final_submission": False,
    }
    response = client.post("/api/v1/submissions", json=payload, headers=carrier_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "DRAFT"
    assert data["insured_name"] == "BioHealth Pharma Corp"
    assert data["risk_tier"] == "LOW"


def test_list_carrier_submissions(client: TestClient, carrier_headers: dict):
    response = client.get(
        "/api/v1/submissions?skip=0&limit=10", headers=carrier_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)


def test_upload_attachment_and_resolve_missing_flags(
    client: TestClient, carrier_headers: dict
):
    # 1. Create Cyber submission
    payload = {
        "risk_type": "CYBER",
        "insured_name": "DefendCloud Networks",
        "industry_segment": "Technology",
        "annual_revenue": 50000000.0,
        "sum_insured": 5000000.0,
        "attachment_point": 1000000.0,
        "policy_start_date": "2026-09-01",
        "policy_end_date": "2027-09-01",
        "prior_claims_count": 0,
        "prior_claims_total": 0.0,
        "security_governance_score": 80.0,
        "is_final_submission": True,
    }
    create_resp = client.post(
        "/api/v1/submissions", json=payload, headers=carrier_headers
    )
    assert create_resp.status_code == 201
    sub_id = create_resp.json()["id"]

    # Check detail before upload - should have missing CYBER_ASSESSMENT flag
    detail_resp = client.get(f"/api/v1/submissions/{sub_id}", headers=carrier_headers)
    assert detail_resp.status_code == 200
    flags = detail_resp.json()["missing_flags"]
    assert any(f["field_name"] == "CYBER_ASSESSMENT" for f in flags)

    # 2. Upload Cyber Assessment document
    file_content = b"Cyber Assessment Questionnaire responses and security audit logs."
    files = {
        "file": ("cyber_assessment.pdf", io.BytesIO(file_content), "application/pdf")
    }
    data = {"document_category": "CYBER_ASSESSMENT"}

    upload_resp = client.post(
        f"/api/v1/submissions/{sub_id}/attachments",
        files=files,
        data=data,
        headers=carrier_headers,
    )
    assert upload_resp.status_code == 201
    att_data = upload_resp.json()
    assert att_data["document_category"] == "CYBER_ASSESSMENT"
    assert att_data["file_name"] == "cyber_assessment.pdf"

    # Check detail after upload - CYBER_ASSESSMENT flag should now be absent
    detail_resp_after = client.get(
        f"/api/v1/submissions/{sub_id}", headers=carrier_headers
    )
    assert detail_resp_after.status_code == 200
    flags_after = detail_resp_after.json()["missing_flags"]
    assert not any(f["field_name"] == "CYBER_ASSESSMENT" for f in flags_after)

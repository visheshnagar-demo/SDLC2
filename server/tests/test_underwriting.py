import io
from fastapi.testclient import TestClient
from server.routers.auth_router import create_access_token


def test_underwriting_queue_and_filters(client: TestClient, underwriter_headers: dict):
    response = client.get(
        "/api/v1/underwriting/queue?risk_type=CYBER", headers=underwriter_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert all(item["risk_type"] == "CYBER" for item in data["items"])


def test_underwriting_queue_search_and_sorting(
    client: TestClient, underwriter_headers: dict
):
    response = client.get(
        "/api/v1/underwriting/queue?search=Apex&sort_by=risk_score&sort_order=desc",
        headers=underwriter_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) >= 1
    assert "Apex" in data["items"][0]["insured_name"]


def test_underwriting_submission_detail(client: TestClient, underwriter_headers: dict):
    # Find a submission in queue
    queue_resp = client.get("/api/v1/underwriting/queue", headers=underwriter_headers)
    assert queue_resp.status_code == 200
    items = queue_resp.json()["items"]
    assert len(items) > 0
    sub_id = items[0]["id"]

    detail_resp = client.get(
        f"/api/v1/underwriting/submissions/{sub_id}", headers=underwriter_headers
    )
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == sub_id
    assert "risk_score_breakdowns" in detail
    assert "missing_flags" in detail
    assert "audit_logs" in detail


def test_concurrency_lock_lifecycle(client: TestClient, underwriter_headers: dict):
    # 1. Create a fresh submitted request
    carrier_token = create_access_token(
        data={"sub": "test@example.com", "role": "carrier"}
    )
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "risk_type": "CYBER",
            "insured_name": "Lock Testing Systems",
            "industry_segment": "Finance",
            "annual_revenue": 100000000.0,
            "sum_insured": 10000000.0,
            "attachment_point": 2000000.0,
            "policy_start_date": "2026-07-01",
            "policy_end_date": "2027-07-01",
            "prior_claims_count": 0,
            "prior_claims_total": 0.0,
            "security_governance_score": 88.0,
            "is_final_submission": True,
        },
        headers=carrier_headers,
    )
    assert create_resp.status_code == 201
    sub_id = create_resp.json()["id"]

    # 2. Acquire lock as admin underwriter
    lock_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/lock",
        json={"action": "ACQUIRE"},
        headers=underwriter_headers,
    )
    assert lock_resp.status_code == 200
    assert lock_resp.json()["locked"] is True

    # 3. Another underwriter attempts to acquire lock -> 409 Conflict
    other_token = create_access_token(
        data={"sub": "underwriter@example.com", "role": "underwriter"}
    )
    other_headers = {"Authorization": f"Bearer {other_token}"}
    conflict_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/lock",
        json={"action": "ACQUIRE"},
        headers=other_headers,
    )
    assert conflict_resp.status_code == 409

    # 4. Release lock
    release_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/lock",
        json={"action": "RELEASE"},
        headers=underwriter_headers,
    )
    assert release_resp.status_code == 200
    assert release_resp.json()["locked"] is False


def test_quote_decision_workflow_with_blocking_rules(
    client: TestClient, underwriter_headers: dict
):
    # 1. Create Cyber submission (starts with blocking missing CYBER_ASSESSMENT flag)
    carrier_token = create_access_token(
        data={"sub": "test@example.com", "role": "carrier"}
    )
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "risk_type": "CYBER",
            "insured_name": "Quote Flow Enterprise",
            "industry_segment": "Technology",
            "annual_revenue": 80000000.0,
            "sum_insured": 5000000.0,
            "attachment_point": 1000000.0,
            "policy_start_date": "2026-08-01",
            "policy_end_date": "2027-08-01",
            "prior_claims_count": 0,
            "prior_claims_total": 0.0,
            "security_governance_score": 90.0,
            "is_final_submission": True,
        },
        headers=carrier_headers,
    )
    assert create_resp.status_code == 201
    sub_id = create_resp.json()["id"]

    # 2. Attempt QUOTE before resolving blocking flag -> should fail 422
    quote_payload = {
        "decision": "QUOTE",
        "capacity_offered": 5000000.0,
        "rate_on_line_pct": 3.25,
        "binding_deadline": "2026-07-15",
        "subjectivities": "Standard multi-factor authentication warranty required.",
    }
    blocked_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=quote_payload,
        headers=underwriter_headers,
    )
    assert blocked_resp.status_code == 422

    # 3. Carrier uploads required CYBER_ASSESSMENT
    file_content = b"Completed Cyber Assessment Questionnaire."
    files = {"file": ("cyber_survey.pdf", io.BytesIO(file_content), "application/pdf")}
    upload_resp = client.post(
        f"/api/v1/submissions/{sub_id}/attachments",
        files=files,
        data={"document_category": "CYBER_ASSESSMENT"},
        headers=carrier_headers,
    )
    assert upload_resp.status_code == 201

    # 4. Now underwriter QUOTEs successfully
    success_quote_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=quote_payload,
        headers=underwriter_headers,
    )
    assert success_quote_resp.status_code == 201
    dec_data = success_quote_resp.json()
    assert dec_data["decision"] == "QUOTE"
    assert dec_data["status"] == "QUOTED"
    # Premium = 5,000,000 * 3.25% = 162,500
    assert dec_data["premium_amount"] == 162500.0
    assert dec_data["capacity_offered"] == 5000000.0


def test_decline_decision_workflow(client: TestClient, underwriter_headers: dict):
    # 1. Create D&O submission
    carrier_token = create_access_token(
        data={"sub": "test@example.com", "role": "carrier"}
    )
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "risk_type": "D_AND_O",
            "insured_name": "High Risk Speculation Corp",
            "industry_segment": "Finance",
            "annual_revenue": 20000000.0,
            "sum_insured": 10000000.0,
            "attachment_point": 500000.0,
            "policy_start_date": "2026-08-01",
            "policy_end_date": "2027-08-01",
            "prior_claims_count": 3,
            "prior_claims_total": 4500000.0,
            "security_governance_score": 45.0,
            "is_final_submission": True,
        },
        headers=carrier_headers,
    )
    assert create_resp.status_code == 201
    sub_id = create_resp.json()["id"]

    # 2. Decline without reason code -> 422
    fail_decline = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json={"decision": "DECLINE"},
        headers=underwriter_headers,
    )
    assert fail_decline.status_code == 422

    # 3. Decline with valid standardized reason code
    decline_payload = {
        "decision": "DECLINE",
        "decline_reason_code": "RISK_APPETITE_EXCEEDED",
        "decline_notes": "Adverse litigation history exceeds maximum tolerable capacity loss threshold.",
    }
    decline_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=decline_payload,
        headers=underwriter_headers,
    )
    assert decline_resp.status_code == 201
    dec_data = decline_resp.json()
    assert dec_data["decision"] == "DECLINE"
    assert dec_data["status"] == "DECLINED"
    assert dec_data["decline_reason_code"] == "RISK_APPETITE_EXCEEDED"

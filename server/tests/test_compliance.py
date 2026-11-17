import io
import uuid


def test_compliance_queue_access_control(
    client, customer_headers, officer_headers, admin_headers
):
    # Customer should be forbidden
    res_customer = client.get(
        "/api/v1/compliance/applications", headers=customer_headers
    )
    assert res_customer.status_code == 403

    # Officer should succeed
    res_officer = client.get("/api/v1/compliance/applications", headers=officer_headers)
    assert res_officer.status_code == 200
    assert "items" in res_officer.json()
    assert "total" in res_officer.json()

    # Admin should succeed
    res_admin = client.get("/api/v1/compliance/applications", headers=admin_headers)
    assert res_admin.status_code == 200


def test_compliance_application_detail_and_decision(
    client, customer_headers, officer_headers
):
    # Customer creates an application by uploading doc + verifying biometrics
    file_obj = io.BytesIO(b"Flagged Passport binary data")
    doc_res = client.post(
        "/api/v1/documents/upload",
        headers=customer_headers,
        data={"doc_type": "PASSPORT"},
        files={"file": ("passport.pdf", file_obj, "application/pdf")},
    )
    doc_id = doc_res.json()["document_id"]

    client.post(
        "/api/v1/biometrics/verify",
        headers=customer_headers,
        json={"document_id": doc_id},
    )

    # Officer lists applications
    list_res = client.get("/api/v1/compliance/applications", headers=officer_headers)
    assert list_res.status_code == 200
    apps = list_res.json()["items"]
    assert len(apps) > 0
    target_app_id = apps[0]["application_id"]

    # Officer views detail
    detail_res = client.get(
        f"/api/v1/compliance/applications/{target_app_id}", headers=officer_headers
    )
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["application_id"] == target_app_id
    assert detail_data["user"] is not None
    assert detail_data["document"] is not None

    # Officer submits APPROVED decision
    decision_payload = {
        "decision": "APPROVED",
        "notes": "Visual comparison matches high quality passport scan.",
        "reason_code": "MANUAL_MATCH_CONFIRMED",
    }
    decision_res = client.post(
        f"/api/v1/compliance/applications/{target_app_id}/decision",
        headers=officer_headers,
        json=decision_payload,
    )
    assert decision_res.status_code == 200
    dec_data = decision_res.json()
    assert dec_data["decision"] == "APPROVED"
    assert dec_data["application_id"] == target_app_id
    assert "review_id" in dec_data


def test_compliance_decision_invalid_value(client, officer_headers):
    dummy_app_id = str(uuid.uuid4())
    res = client.post(
        f"/api/v1/compliance/applications/{dummy_app_id}/decision",
        headers=officer_headers,
        json={
            "decision": "MAYBE",
            "notes": "Unsure about decision",
            "reason_code": "UNKNOWN",
        },
    )
    assert res.status_code == 400

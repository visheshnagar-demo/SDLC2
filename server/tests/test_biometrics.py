import io
import uuid


def test_verify_biometrics_multipart(client, customer_headers):
    # Upload document first
    file_obj = io.BytesIO(b"Passport file bytes")
    doc_res = client.post(
        "/api/v1/documents/upload",
        headers=customer_headers,
        data={"doc_type": "PASSPORT"},
        files={"file": ("passport.pdf", file_obj, "application/pdf")},
    )
    doc_id = doc_res.json()["document_id"]

    # Verify selfie
    selfie_file = io.BytesIO(b"Selfie frame camera bytes")
    res = client.post(
        "/api/v1/biometrics/verify",
        headers=customer_headers,
        data={"document_id": doc_id},
        files={"selfie_image": ("selfie.png", selfie_file, "image/png")},
    )
    assert res.status_code == 200
    data = res.json()
    assert "biometric_id" in data
    assert data["liveness_passed"] is True
    assert data["match_score"] >= 85.0
    assert data["status"] == "VERIFIED"


def test_verify_biometrics_json(client, customer_headers):
    file_obj = io.BytesIO(b"Passport file bytes")
    doc_res = client.post(
        "/api/v1/documents/upload",
        headers=customer_headers,
        data={"doc_type": "PASSPORT"},
        files={"file": ("passport.pdf", file_obj, "application/pdf")},
    )
    doc_id = doc_res.json()["document_id"]

    res = client.post(
        "/api/v1/biometrics/verify",
        headers=customer_headers,
        json={
            "document_id": doc_id,
            "selfie_image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "biometric_id" in data
    assert data["liveness_passed"] is True


def test_verify_biometrics_document_not_found(client, customer_headers):
    random_doc_id = str(uuid.uuid4())
    res = client.post(
        "/api/v1/biometrics/verify",
        headers=customer_headers,
        json={"document_id": random_doc_id},
    )
    assert res.status_code == 404


def test_get_biometric_status(client, customer_headers):
    file_obj = io.BytesIO(b"Passport file bytes")
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

    status_res = client.get(
        f"/api/v1/biometrics/status?document_id={doc_id}",
        headers=customer_headers,
    )
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert "biometric_id" in status_data
    assert status_data["match_score"] >= 85.0

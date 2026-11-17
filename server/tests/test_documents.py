import io
import uuid


def test_upload_document_success(client, customer_headers):
    file_content = b"%PDF-1.4 Mock Passport Document binary stream data"
    file_obj = io.BytesIO(file_content)

    res = client.post(
        "/api/v1/documents/upload",
        headers=customer_headers,
        data={"doc_type": "PASSPORT"},
        files={"file": ("passport.pdf", file_obj, "application/pdf")},
    )
    assert res.status_code == 201
    data = res.json()
    assert "document_id" in data
    assert data["doc_type"] == "PASSPORT"
    assert data["status"] == "PROCESSED"
    assert data["ocr_data"] is not None
    assert "full_name" in data["ocr_data"]
    assert "document_number" in data["ocr_data"]
    assert data["ocr_confidence"] >= 90.0


def test_upload_drivers_license(client, customer_headers):
    file_content = b"\x89PNG\r\n\x1a\n Mock DL Image"
    file_obj = io.BytesIO(file_content)

    res = client.post(
        "/api/v1/documents/upload",
        headers=customer_headers,
        data={"doc_type": "DRIVERS_LICENSE"},
        files={"file": ("drivers_license.png", file_obj, "image/png")},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["doc_type"] == "DRIVERS_LICENSE"


def test_upload_invalid_document_type(client, customer_headers):
    file_obj = io.BytesIO(b"dummy content")
    res = client.post(
        "/api/v1/documents/upload",
        headers=customer_headers,
        data={"doc_type": "STUDENT_ID"},
        files={"file": ("id.png", file_obj, "image/png")},
    )
    assert res.status_code == 400
    assert "invalid document type" in res.json()["detail"].lower()


def test_get_document_by_id(client, customer_headers, officer_headers):
    # First upload
    file_obj = io.BytesIO(b"National ID Image bytes")
    upload_res = client.post(
        "/api/v1/documents/upload",
        headers=customer_headers,
        data={"doc_type": "NATIONAL_ID"},
        files={"file": ("national_id.png", file_obj, "image/png")},
    )
    doc_id = upload_res.json()["document_id"]

    # Customer fetches own doc
    res = client.get(f"/api/v1/documents/{doc_id}", headers=customer_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["document_id"] == doc_id
    assert data["doc_type"] == "NATIONAL_ID"

    # Officer can also inspect
    officer_res = client.get(f"/api/v1/documents/{doc_id}", headers=officer_headers)
    assert officer_res.status_code == 200


def test_get_document_not_found(client, customer_headers):
    random_id = str(uuid.uuid4())
    res = client.get(f"/api/v1/documents/{random_id}", headers=customer_headers)
    assert res.status_code == 404

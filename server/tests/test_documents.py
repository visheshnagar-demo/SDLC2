import io


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_upload_document_csv(client):
    csv_content = (
        "ceding_company,line_of_business,claim_id,claim_amount\n"
        "Swiss Re,Property Catastrophe,CLM-001,2500000\n"
        "Swiss Re,Property Catastrophe,CLM-002,1200000\n"
    ).encode("utf-8")

    files = {"file": ("claims_data.csv", io.BytesIO(csv_content), "text/csv")}
    response = client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["file_name"] == "claims_data.csv"
    assert data["file_type"] == "CSV"
    assert "id" in data
    assert data["status"] in ("PROCESSING", "PENDING_INGESTION")
    assert data["extracted_metadata"] is not None
    assert "ceding_company" in data["extracted_metadata"]


def test_upload_document_text_fallback(client):
    doc_content = (
        "Reinsurance Treaty Slip between Gen Re Global and Ceding Partner. "
        "Line of Business: Excess of Loss. Retention: $10M. Limit: $100M."
    ).encode("utf-8")

    files = {"file": ("treaty_slip.pdf", io.BytesIO(doc_content), "application/pdf")}
    response = client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["file_name"] == "treaty_slip.pdf"
    assert "id" in data


def test_upload_empty_file_rejected(client):
    files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    response = client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_list_and_get_documents(client):
    # Upload one document
    content = b"Sample reinsurance text"
    files = {"file": ("doc1.pdf", io.BytesIO(content), "application/pdf")}
    upload_res = client.post("/api/v1/documents/upload", files=files)
    doc_id = upload_res.json()["id"]

    # List documents
    list_res = client.get("/api/v1/documents?skip=0&limit=10")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert "items" in list_data
    assert list_data["total"] >= 1
    assert any(d["id"] == doc_id for d in list_data["items"])

    # Get by ID
    get_res = client.get(f"/api/v1/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == doc_id


def test_get_nonexistent_document_returns_404(client):
    response = client.get("/api/v1/documents/non-existent-uuid")
    assert response.status_code == 404


def test_delete_document(client):
    content = b"Document to delete"
    files = {"file": ("delete_me.pdf", io.BytesIO(content), "application/pdf")}
    upload_res = client.post("/api/v1/documents/upload", files=files)
    doc_id = upload_res.json()["id"]

    del_res = client.delete(f"/api/v1/documents/{doc_id}")
    assert del_res.status_code == 204

    # Verify 404 after deletion
    get_res = client.get(f"/api/v1/documents/{doc_id}")
    assert get_res.status_code == 404

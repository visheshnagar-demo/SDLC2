import io


def test_record_and_list_decisions(client):
    # Upload document
    content = b"Treaty slip for underwriting decision test"
    files = {
        "file": (
            "decision_treaty.docx",
            io.BytesIO(content),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    }
    upload_res = client.post("/api/v1/documents/upload", files=files)
    doc_id = upload_res.json()["id"]

    # Record decision
    payload = {
        "document_id": doc_id,
        "decision": "CONDITIONAL_APPROVAL",
        "underwriter_id": "UW-ALEX-901",
        "reviewer_notes": "Approved subject to strict LMA5400 cyber endorsement.",
        "subjectivities": "Ceding insurer must provide updated historical claims triangle within 30 days.",
    }
    dec_res = client.post("/api/v1/decisions", json=payload)
    assert dec_res.status_code == 201
    dec_data = dec_res.json()
    assert dec_data["decision"] == "CONDITIONAL_APPROVAL"
    assert dec_data["underwriter_id"] == "UW-ALEX-901"
    assert dec_data["document_id"] == doc_id
    dec_id = dec_data["id"]

    # List decisions
    list_res = client.get("/api/v1/decisions")
    assert list_res.status_code == 200
    all_decs = list_res.json()
    assert any(d["id"] == dec_id for d in all_decs)

    # Filter decisions by document_id
    filter_res = client.get(f"/api/v1/decisions?document_id={doc_id}")
    assert filter_res.status_code == 200
    doc_decs = filter_res.json()
    assert len(doc_decs) >= 1
    assert doc_decs[0]["id"] == dec_id

    # Get decision by ID
    get_res = client.get(f"/api/v1/decisions/{dec_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == dec_id


def test_record_decision_invalid_type_returns_400(client):
    content = b"Some treaty"
    files = {"file": ("test_doc.pdf", io.BytesIO(content), "application/pdf")}
    upload_res = client.post("/api/v1/documents/upload", files=files)
    doc_id = upload_res.json()["id"]

    payload = {
        "document_id": doc_id,
        "decision": "INVALID_DECISION_TYPE",
        "underwriter_id": "UW-TEST",
        "reviewer_notes": "Testing invalid decision type",
    }
    res = client.post("/api/v1/decisions", json=payload)
    assert res.status_code == 400


def test_record_decision_nonexistent_doc_returns_400(client):
    payload = {
        "document_id": "non-existent-doc-id",
        "decision": "APPROVED",
        "underwriter_id": "UW-TEST",
        "reviewer_notes": "Testing non-existent document",
    }
    res = client.post("/api/v1/decisions", json=payload)
    assert res.status_code == 400

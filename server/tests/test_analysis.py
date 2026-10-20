import io


def test_trigger_and_get_analysis(client):
    # Upload document first
    content = b"Swiss Re property treaty with cyber and communicable disease clauses."
    files = {"file": ("swiss_re_treaty.pdf", io.BytesIO(content), "application/pdf")}
    upload_res = client.post("/api/v1/documents/upload", files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["id"]

    # Trigger analysis
    trigger_res = client.post("/api/v1/analysis/trigger", json={"document_id": doc_id})
    assert trigger_res.status_code == 201
    job_data = trigger_res.json()
    assert job_data["document_id"] == doc_id
    assert job_data["status"] == "COMPLETED"
    assert job_data["composite_risk_score"] is not None
    assert job_data["risk_tier"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert job_data["summary"] is not None
    job_id = job_data["id"]

    # Get analysis detail
    detail_res = client.get(f"/api/v1/analysis/{job_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == job_id
    assert len(detail_data["clause_evaluations"]) > 0

    # Get clauses
    clauses_res = client.get(f"/api/v1/analysis/{job_id}/clauses")
    assert clauses_res.status_code == 200
    clauses = clauses_res.json()
    assert len(clauses) >= 4
    assert any(c["clause_title"] == "Retention & Attachment Point" for c in clauses)

    # Get clauses filtered by severity
    filtered_res = client.get(f"/api/v1/analysis/{job_id}/clauses?severity=LOW")
    assert filtered_res.status_code == 200
    low_clauses = filtered_res.json()
    assert all(c["risk_severity"] == "LOW" for c in low_clauses)


def test_trigger_analysis_nonexistent_doc_returns_404(client):
    response = client.post(
        "/api/v1/analysis/trigger", json={"document_id": "non-existent-doc-id"}
    )
    assert response.status_code == 404


def test_get_nonexistent_analysis_returns_404(client):
    response = client.get("/api/v1/analysis/non-existent-job-id")
    assert response.status_code == 404

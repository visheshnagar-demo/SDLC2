import io


def test_get_audit_logs(client):
    # Upload document
    content = b"Treaty document for audit testing"
    files = {"file": ("audit_treaty.pdf", io.BytesIO(content), "application/pdf")}
    upload_res = client.post("/api/v1/documents/upload", files=files)
    doc_id = upload_res.json()["id"]

    # Trigger analysis
    trigger_res = client.post("/api/v1/analysis/trigger", json={"document_id": doc_id})
    job_id = trigger_res.json()["id"]

    # Get audit logs
    audit_res = client.get(f"/api/v1/audit/logs/{job_id}")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) == 4
    agent_names = [log["agent_name"] for log in logs]
    assert "Document Extractor Agent" in agent_names
    assert "Clause Review Agent" in agent_names
    assert "Risk Scorer Agent" in agent_names
    assert "Validation & Circuit Breaker Guard" in agent_names


def test_get_audit_logs_nonexistent_job_returns_404(client):
    res = client.get("/api/v1/audit/logs/non-existent-job-id")
    assert res.status_code == 404

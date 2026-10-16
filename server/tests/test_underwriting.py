def test_underwriter_queue_workflow(client):
    # Create two submissions
    sub1_payload = {
        "risk_type": "CYBER",
        "insured_name": "Alpha Cyber Shield Corp",
        "industry_sector": "Information Technology",
        "annual_revenue": 100000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 5000000.0,
        "policy_effective_date": "2026-05-01",
        "policy_expiration_date": "2027-05-01",
        "risk_profile": {
            "mfa_enforced": True,
            "has_offline_backups": True,
            "security_framework": "SOC2",
        },
        "documents": [
            {
                "document_type": "PRIMARY_POLICY_SCHEDULE",
                "file_name": "Alpha_Schedule.pdf",
                "file_size_bytes": 1024,
            }
        ],
    }
    res1 = client.post("/api/v1/submissions", json=sub1_payload)
    assert res1.status_code == 201
    sub1_id = res1.json()["id"]

    sub2_payload = {
        "risk_type": "D_AND_O",
        "insured_name": "Beta Executive Holdings",
        "industry_sector": "Financial Services",
        "annual_revenue": 40000000.0,
        "primary_policy_limit": 5000000.0,
        "requested_reinsurance_limit": 2500000.0,
        "attachment_point": 1000000.0,
        "policy_effective_date": "2026-06-01",
        "policy_expiration_date": "2027-06-01",
    }
    res2 = client.post("/api/v1/submissions", json=sub2_payload)
    assert res2.status_code == 201
    sub2_id = res2.json()["id"]

    # Query queue
    q_res = client.get("/api/v1/underwriting/queue?skip=0&limit=10")
    assert q_res.status_code == 200
    q_data = q_res.json()
    assert q_data["total"] >= 2
    item_ids = [item["id"] for item in q_data["items"]]
    assert sub1_id in item_ids
    assert sub2_id in item_ids

    # Query queue filtered by risk_type
    cyber_q = client.get("/api/v1/underwriting/queue?risk_type=CYBER")
    assert cyber_q.status_code == 200
    assert all(item["risk_type"] == "CYBER" for item in cyber_q.json()["items"])

    # Query queue with search
    search_q = client.get("/api/v1/underwriting/queue?search=Alpha")
    assert search_q.status_code == 200
    assert any("Alpha" in item["insured_name"] for item in search_q.json()["items"])


def test_recompute_risk_score(client):
    # Create submission with missing fields
    sub_payload = {
        "risk_type": "CYBER",
        "insured_name": "Delta Networks Ltd",
        "industry_sector": "Telecommunications",
        "annual_revenue": 80000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 5000000.0,
        "policy_effective_date": "2026-09-01",
        "policy_expiration_date": "2027-09-01",
    }
    res = client.post("/api/v1/submissions", json=sub_payload)
    assert res.status_code == 201
    sub_id = res.json()["id"]

    # Recompute score
    score_res = client.post(f"/api/v1/underwriting/submissions/{sub_id}/score")
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert score_data["submission_id"] == sub_id
    assert "overall_score" in score_data
    assert "risk_tier" in score_data

    # Recompute on non-existent submission
    nf_res = client.post("/api/v1/underwriting/submissions/non-existent/score")
    assert nf_res.status_code == 404


def test_audit_trail(client):
    sub_payload = {
        "risk_type": "D_AND_O",
        "insured_name": "Epsilon BioHealth Corp",
        "industry_sector": "Healthcare",
        "annual_revenue": 60000000.0,
        "primary_policy_limit": 8000000.0,
        "requested_reinsurance_limit": 4000000.0,
        "attachment_point": 2000000.0,
        "policy_effective_date": "2026-10-01",
        "policy_expiration_date": "2027-10-01",
    }
    res = client.post("/api/v1/submissions", json=sub_payload)
    assert res.status_code == 201
    sub_id = res.json()["id"]

    # Check audit trail
    audit_res = client.get(f"/api/v1/underwriting/submissions/{sub_id}/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 1
    assert logs[0]["action"] == "SUBMISSION_CREATED"

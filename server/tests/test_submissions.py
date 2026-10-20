def test_create_submission_success(client, underwriter_headers):
    payload = {
        "ceding_org_id": "HGIC-770",
        "insured_name": "Nexus Health Systems Inc.",
        "line_of_business": "CYBER",
        "policy_limit": 10000000.0,
        "attachment_point": 2000000.0,
        "retention": 500000.0,
        "proposed_premium": 350000.0,
        "effective_date": "2026-11-01",
        "expiry_date": "2027-11-01",
        "industry": "Healthcare",
        "revenue_band": "$500M - $1B",
        "jurisdiction": "New York, USA",
    }
    res = client.post("/api/v1/submissions", json=payload, headers=underwriter_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["insured_name"] == "Nexus Health Systems Inc."
    assert data["status"] == "RECEIVED"
    assert data["completeness_status"] == "INCOMPLETE"
    assert "submission_number" in data
    assert data["requires_manager_referral"] is True  # 10M > 5M


def test_submission_validation_errors(client, underwriter_headers):
    # Case 1: limit <= attachment point
    invalid_limit_payload = {
        "ceding_org_id": "HGIC-770",
        "insured_name": "Invalid Limits Corp",
        "line_of_business": "CYBER",
        "policy_limit": 1000000.0,
        "attachment_point": 2000000.0,  # Attachment > Limit
        "retention": 500000.0,
        "proposed_premium": 350000.0,
        "effective_date": "2026-11-01",
        "expiry_date": "2027-11-01",
    }
    res1 = client.post(
        "/api/v1/submissions", json=invalid_limit_payload, headers=underwriter_headers
    )
    assert res1.status_code == 422

    # Case 2: expiry date <= effective date
    invalid_date_payload = {
        "ceding_org_id": "HGIC-770",
        "insured_name": "Invalid Dates Corp",
        "line_of_business": "CYBER",
        "policy_limit": 5000000.0,
        "attachment_point": 1000000.0,
        "retention": 100000.0,
        "proposed_premium": 50000.0,
        "effective_date": "2027-01-01",
        "expiry_date": "2026-01-01",  # Expiry before effective
    }
    res2 = client.post(
        "/api/v1/submissions", json=invalid_date_payload, headers=underwriter_headers
    )
    assert res2.status_code == 422


def test_document_upload_and_completeness_check(client, underwriter_headers):
    # Create Cyber submission
    payload = {
        "ceding_org_id": "HGIC-770",
        "insured_name": "SecureCorp Tech",
        "line_of_business": "CYBER",
        "policy_limit": 4000000.0,
        "attachment_point": 1000000.0,
        "retention": 250000.0,
        "proposed_premium": 120000.0,
        "effective_date": "2026-06-01",
        "expiry_date": "2027-06-01",
    }
    res = client.post("/api/v1/submissions", json=payload, headers=underwriter_headers)
    sub_id = res.json()["id"]
    assert res.json()["completeness_status"] == "INCOMPLETE"

    # Upload Doc 1: APPLICATION
    doc1 = client.post(
        f"/api/v1/submissions/{sub_id}/documents",
        json={"document_type": "APPLICATION", "file_name": "cyber_app_2026.pdf"},
        headers=underwriter_headers,
    )
    assert doc1.status_code == 201

    sub_res1 = client.get(f"/api/v1/submissions/{sub_id}", headers=underwriter_headers)
    assert sub_res1.json()["completeness_status"] == "INCOMPLETE"

    # Upload Doc 2: LOSS_RUNS
    client.post(
        f"/api/v1/submissions/{sub_id}/documents",
        json={"document_type": "LOSS_RUNS", "file_name": "5yr_loss_history.xlsx"},
        headers=underwriter_headers,
    )

    # Upload Doc 3: SECURITY_AUDIT (Completes Cyber requirements)
    client.post(
        f"/api/v1/submissions/{sub_id}/documents",
        json={"document_type": "SECURITY_AUDIT", "file_name": "soc2_audit.pdf"},
        headers=underwriter_headers,
    )

    sub_res2 = client.get(f"/api/v1/submissions/{sub_id}", headers=underwriter_headers)
    assert sub_res2.json()["completeness_status"] == "COMPLETE"
    assert len(sub_res2.json()["documents"]) == 3


def test_submissions_list_and_rbac(client, underwriter_headers, ceding_headers):
    # Underwriter creates submission for HGIC-770
    client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Hartford Client Alpha",
            "line_of_business": "DO",
            "policy_limit": 3000000.0,
            "attachment_point": 500000.0,
            "retention": 100000.0,
            "proposed_premium": 80000.0,
            "effective_date": "2026-08-01",
            "expiry_date": "2027-08-01",
        },
        headers=underwriter_headers,
    )

    # Underwriter creates submission for TNS-104 (Travelers)
    client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "TNS-104",
            "insured_name": "Travelers Client Beta",
            "line_of_business": "EO",
            "policy_limit": 2000000.0,
            "attachment_point": 250000.0,
            "retention": 50000.0,
            "proposed_premium": 40000.0,
            "effective_date": "2026-09-01",
            "expiry_date": "2027-09-01",
        },
        headers=underwriter_headers,
    )

    # Reinsurance underwriter lists all submissions
    uw_list = client.get("/api/v1/submissions", headers=underwriter_headers)
    assert uw_list.status_code == 200
    assert uw_list.json()["total"] >= 2

    # Ceding underwriter (org HGIC-770) lists submissions -> sees only HGIC-770
    cedent_list = client.get("/api/v1/submissions", headers=ceding_headers)
    assert cedent_list.status_code == 200
    for item in cedent_list.json()["items"]:
        assert item["ceding_org_id"] == "HGIC-770"

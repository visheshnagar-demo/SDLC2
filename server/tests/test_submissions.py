def test_submit_cyber_request_success(client, carrier_token):
    # AC: Carrier Request Submission Interface: Carriers can submit Cyber requests with full risk attributes
    headers = {"Authorization": f"Bearer {carrier_token}"}
    payload = {
        "insured_name": "Nordic Health Systems Corp",
        "industry_segment": "Healthcare",
        "risk_type": "CYBER",
        "annual_revenue": 50000000.0,
        "sum_insured": 10000000.0,
        "attachment_point": 500000.0,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
        "prior_claims_count": 0,
        "prior_claims_total": 0.0,
        "security_governance_score": 85.0,
    }
    response = client.post("/api/v1/submissions", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Nordic Health Systems Corp"
    assert data["risk_type"] == "CYBER"
    assert "submission_reference" in data
    assert data["submission_reference"].startswith("FAC-CYBER-")
    assert isinstance(data["risk_score"], (int, float))
    assert data["risk_tier"] in ["LOW", "MEDIUM", "HIGH"]
    assert len(data["risk_score_breakdowns"]) > 0


def test_submit_d_and_o_request_success(client, carrier_token):
    # AC: Carrier Request Submission Interface: Carriers can submit D&O requests with full risk attributes
    headers = {"Authorization": f"Bearer {carrier_token}"}
    payload = {
        "insured_name": "Apex Global Logistics Inc",
        "industry_segment": "Transportation & Logistics",
        "risk_type": "D_AND_O",
        "annual_revenue": 150000000.0,
        "sum_insured": 25000000.0,
        "attachment_point": 2500000.0,
        "policy_start_date": "2026-07-01",
        "policy_end_date": "2027-07-01",
        "prior_claims_count": 1,
        "prior_claims_total": 120000.0,
        "security_governance_score": 60.0,
    }
    response = client.post("/api/v1/submissions", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Apex Global Logistics Inc"
    assert data["risk_type"] == "D_AND_O"
    assert data["submission_reference"].startswith("FAC-DO-")


def test_automated_risk_scoring_high_risk_tier(client, carrier_token):
    # AC: Automated Risk Scoring Engine: System automatically scores submissions and categorizes risk levels
    headers = {"Authorization": f"Bearer {carrier_token}"}
    payload = {
        "insured_name": "Vulnerable Retail Chain",
        "industry_segment": "Retail",
        "risk_type": "CYBER",
        "annual_revenue": 80000000.0,
        "sum_insured": 20000000.0,
        "attachment_point": 500000.0,  # low buffer (<10%)
        "prior_claims_count": 3,
        "prior_claims_total": 1200000.0,
        "security_governance_score": 25.0,  # critical deficit (<40)
    }
    response = client.post("/api/v1/submissions", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["risk_score"] > 70.0
    assert data["risk_tier"] == "HIGH"


def test_missing_information_flagging(client, carrier_token):
    # AC: Missing Information Flagging: Missing mandatory fields or documents are tagged and visually flagged
    headers = {"Authorization": f"Bearer {carrier_token}"}
    payload = {
        "insured_name": "Incomplete Submission Corp",
        "industry_segment": "Technology",
        "risk_type": "CYBER",
        "annual_revenue": 2000000.0,
        "sum_insured": 5000000.0,
        "attachment_point": 500000.0,
        "policy_start_date": "",  # missing dates
        "policy_end_date": "",
        "prior_claims_count": 1,  # has claims but no loss run attachment
        "prior_claims_total": 50000.0,
        "security_governance_score": 0.0,
    }
    response = client.post("/api/v1/submissions", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    flag_fields = [f["field_name"] for f in data["missing_flags"]]
    assert "loss_runs" in flag_fields
    assert "policy_period" in flag_fields
    assert "security_governance_score" in flag_fields


def test_attachment_upload_and_flag_update(client, carrier_token):
    # AC: Carrier Request Submission Interface: File attachment upload
    headers = {"Authorization": f"Bearer {carrier_token}"}
    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "Cloud Security Holdings",
            "industry_segment": "Tech",
            "risk_type": "CYBER",
            "annual_revenue": 10000000.0,
            "sum_insured": 5000000.0,
            "attachment_point": 500000.0,
            "prior_claims_count": 1,
            "prior_claims_total": 50000.0,
            "security_governance_score": 75.0,
        },
        headers=headers,
    )
    sub_id = create_resp.json()["id"]

    # Upload Loss Run document
    att_resp = client.post(
        f"/api/v1/submissions/{sub_id}/attachments",
        json={
            "file_name": "5_Year_Loss_Run_Report.pdf",
            "file_type": "application/pdf",
            "file_size": 204800,
            "document_category": "LOSS_RUNS",
        },
        headers=headers,
    )
    assert att_resp.status_code == 201
    assert att_resp.json()["file_name"] == "5_Year_Loss_Run_Report.pdf"

    # Verify submission details now reflect the attachment
    get_resp = client.get(f"/api/v1/submissions/{sub_id}", headers=headers)
    assert get_resp.status_code == 200
    sub_data = get_resp.json()
    assert len(sub_data["attachments"]) == 1
    # loss_runs flag should be resolved/removed
    flag_fields = [f["field_name"] for f in sub_data["missing_flags"]]
    assert "loss_runs" not in flag_fields


def test_list_carrier_submissions(client, carrier_token):
    headers = {"Authorization": f"Bearer {carrier_token}"}
    # Create two submissions
    for name in ["Carrier Sub A", "Carrier Sub B"]:
        client.post(
            "/api/v1/submissions",
            json={
                "insured_name": name,
                "industry_segment": "Finance",
                "risk_type": "CYBER",
                "annual_revenue": 10000000.0,
                "sum_insured": 5000000.0,
                "attachment_point": 500000.0,
            },
            headers=headers,
        )

    response = client.get("/api/v1/submissions", headers=headers)
    assert response.status_code == 200
    submissions = response.json()
    assert len(submissions) >= 2


def test_submission_validation_error_on_missing_fields(client, carrier_token):
    # Missing required field 'sum_insured' and 'insured_name'
    headers = {"Authorization": f"Bearer {carrier_token}"}
    response = client.post(
        "/api/v1/submissions",
        json={"industry_segment": "Finance"},
        headers=headers,
    )
    assert response.status_code == 422

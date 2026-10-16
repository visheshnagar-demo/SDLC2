def test_submit_cyber_facultative_request(client):
    payload = {
        "carrier_id": "CARRIER-CYB-101",
        "carrier_name": "Chubb Specialty Underwriters",
        "insured_name": "Apex Cloud Infrastructure Inc",
        "industry_sector": "Technology",
        "annual_revenue": 200000000.0,
        "risk_type": "CYBER",
        "requested_limit": 15000000.0,
        "attachment_point": 2000000.0,
        "policy_effective_date": "2026-12-01",
        "policy_expiration_date": "2027-12-01",
        "risk_parameters": {
            "mfa_enforced": True,
            "edr_deployed": True,
            "backup_isolation": True,
            "security_audit_recency_months": 3,
            "prior_breaches_3yr": 0,
            "total_breach_losses": 0,
            "has_ransomware_questionnaire": True,
            "has_security_audit_report": True,
            "has_loss_runs_3yr": True,
        },
        "attachments": [
            {
                "document_type": "QUESTIONNAIRE",
                "file_name": "cyber_ransomware_questionnaire.pdf",
                "file_size_bytes": 102400,
                "file_path": "uploads/cyber_ransomware_questionnaire.pdf",
            }
        ],
    }

    response = client.post("/api/v1/reinsurance/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["carrier_id"] == "CARRIER-CYB-101"
    assert data["insured_name"] == "Apex Cloud Infrastructure Inc"
    assert data["risk_type"] == "CYBER"
    assert data["status"] == "SUBMITTED"
    assert data["risk_score"] is not None
    assert "composite_score" in data["risk_score"]
    assert "risk_tier" in data["risk_score"]
    assert len(data["attachments"]) == 1


def test_submit_dno_facultative_request(client):
    payload = {
        "carrier_id": "CARRIER-DNO-202",
        "carrier_name": "AIG Executive Risk",
        "insured_name": "Beacon Health Systems",
        "industry_sector": "Healthcare",
        "annual_revenue": 800000000.0,
        "risk_type": "D_AND_O",
        "requested_limit": 50000000.0,
        "attachment_point": 10000000.0,
        "policy_effective_date": "2026-11-15",
        "policy_expiration_date": "2027-11-15",
        "risk_parameters": {
            "debt_to_equity_ratio": 1.5,
            "market_cap": 1200000000.0,
            "prior_claims_3yr": 0,
            "regulatory_investigations": 0,
            "shareholder_suits": 0,
            "board_tenure_years": 6.0,
            "independent_board_pct": 80.0,
            "has_audited_financials": True,
            "has_loss_runs_3yr": True,
            "has_governance_statement": True,
        },
    }

    response = client.post("/api/v1/reinsurance/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["risk_type"] == "D_AND_O"
    assert data["risk_score"]["risk_tier"] in ["LOW", "MEDIUM"]


def test_submission_validation_errors(client):
    # Invalid date sequence (expiration before effective)
    invalid_payload = {
        "carrier_id": "CARRIER-ERR",
        "carrier_name": "Error Carrier",
        "insured_name": "Test Company",
        "industry_sector": "Technology",
        "annual_revenue": 100000.0,
        "risk_type": "CYBER",
        "requested_limit": 1000000.0,
        "attachment_point": 100000.0,
        "policy_effective_date": "2027-01-01",
        "policy_expiration_date": "2026-01-01",  # Earlier than effective
    }
    response = client.post("/api/v1/reinsurance/submissions", json=invalid_payload)
    assert response.status_code == 422


def test_get_submission_detail_and_list(client):
    # List submissions
    list_res = client.get("/api/v1/reinsurance/submissions?skip=0&limit=10")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert len(list_data["items"]) >= 1

    sub_id = list_data["items"][0]["id"]
    detail_res = client.get(f"/api/v1/reinsurance/submissions/{sub_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == sub_id
    assert "missing_info_flags" in detail_data


def test_add_submission_attachment(client):
    # Submit a basic request
    payload = {
        "carrier_id": "CARRIER-ATT",
        "carrier_name": "Zurich North America",
        "insured_name": "Delta Logistics LLC",
        "industry_sector": "Logistics",
        "annual_revenue": 50000000.0,
        "risk_type": "CYBER",
        "requested_limit": 5000000.0,
        "attachment_point": 500000.0,
        "policy_effective_date": "2026-12-01",
        "policy_expiration_date": "2027-12-01",
    }
    create_res = client.post("/api/v1/reinsurance/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Upload attachment
    att_payload = {
        "document_type": "LOSS_RUNS",
        "file_name": "delta_3yr_loss_runs.pdf",
        "file_size_bytes": 204800,
        "file_path": "uploads/delta_3yr_loss_runs.pdf",
    }
    att_res = client.post(f"/api/v1/reinsurance/submissions/{sub_id}/attachments", json=att_payload)
    assert att_res.status_code == 201
    att_data = att_res.json()
    assert att_data["file_name"] == "delta_3yr_loss_runs.pdf"
    assert att_data["submission_id"] == sub_id

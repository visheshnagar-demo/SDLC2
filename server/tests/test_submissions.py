def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_create_cyber_submission_success(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Apex Global Financial Corp",
        "industry_sector": "Financial Services",
        "annual_revenue": 250000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 5000000.0,
        "policy_effective_date": "2026-06-01",
        "policy_expiration_date": "2027-06-01",
        "risk_profile": {
            "prior_losses_count": 0,
            "total_loss_amount": 0.0,
            "security_framework": "SOC2_TYPE2",
            "mfa_enforced": True,
            "has_offline_backups": True,
            "has_pending_claims": False,
        },
        "documents": [
            {
                "document_type": "PRIMARY_POLICY_SCHEDULE",
                "file_name": "Apex_Cyber_Primary_2026.pdf",
                "file_size_bytes": 1048576,
            }
        ],
    }

    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Apex Global Financial Corp"
    assert data["risk_type"] == "CYBER"
    assert data["tracking_number"].startswith("FAC-")
    assert data["risk_score"] is not None
    assert len(data["documents"]) == 1
    assert data["risk_profile"]["mfa_enforced"] is True


def test_create_submission_flexible_dates_and_aliases(client):
    # Tests sending expiration_date & effective_date (without policy_ prefix)
    payload = {
        "risk_type": "Cyber Risk",
        "insured_name": "Flexible Dates Corp",
        "industry_sector": "Technology",
        "annual_revenue": 75000000.0,
        "primary_limit": 8000000.0,
        "requested_limit": 4000000.0,
        "retention": 4000000.0,
        "effective_date": "2026-05-15",
        "expiration_date": "2027-05-15",
        "risk_profile": {
            "mfa_implemented": True,
            "cloud_backup_frequency": "DAILY",
            "prior_cyber_incidents_3yr": 0,
        },
    }

    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Flexible Dates Corp"
    assert data["risk_type"] == "CYBER"
    assert data["policy_effective_date"] == "2026-05-15"
    assert data["policy_expiration_date"] == "2027-05-15"
    assert data["primary_policy_limit"] == 8000000.0
    assert data["requested_reinsurance_limit"] == 4000000.0
    assert data["attachment_point"] == 4000000.0


def test_create_submission_sum_insured_and_fallbacks(client):
    # Tests minimal submission with sum_insured and missing industry/attachment
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Sum Insured Corp",
        "sum_insured": 12000000.0,
        "requested_limit": 6000000.0,
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Sum Insured Corp"
    assert data["primary_policy_limit"] == 12000000.0
    assert data["sum_insured"] == 12000000.0
    assert data["requested_reinsurance_limit"] == 6000000.0
    assert data["requested_limit"] == 6000000.0
    assert data["attachment_point"] == 0.0


def test_create_submission_industry_and_attachment_aliases(client):
    # Tests industry alias and attachment alias
    payload = {
        "risk_type": "D_AND_O",
        "company_name": "Executive Alpha Corp",
        "industry": "Healthcare",
        "revenue": 30000000.0,
        "policy_limit": 6000000.0,
        "reinsurance_limit": 3000000.0,
        "attachment": 1000000.0,
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Executive Alpha Corp"
    assert data["risk_type"] == "D_AND_O"
    assert data["industry_sector"] == "Healthcare"
    assert data["annual_revenue"] == 30000000.0
    assert data["primary_policy_limit"] == 6000000.0
    assert data["requested_reinsurance_limit"] == 3000000.0
    assert data["attachment_point"] == 1000000.0


def test_create_d_and_o_submission_success(client):
    payload = {
        "risk_type": "D_AND_O",
        "insured_name": "Titan Technologies Ltd",
        "industry_sector": "Technology",
        "annual_revenue": 150000000.0,
        "primary_policy_limit": 15000000.0,
        "requested_reinsurance_limit": 10000000.0,
        "attachment_point": 10000000.0,
        "policy_effective_date": "2026-07-01",
        "policy_expiration_date": "2027-07-01",
        "risk_profile": {
            "prior_losses_count": 1,
            "total_loss_amount": 50000.0,
            "has_pending_claims": False,
        },
        "documents": [
            {
                "document_type": "PRIMARY_POLICY_SCHEDULE",
                "file_name": "Titan_DO_Schedule.pdf",
                "file_size_bytes": 524288,
            },
            {
                "document_type": "FINANCIAL_STATEMENT",
                "file_name": "Titan_2025_Audited_Financials.pdf",
                "file_size_bytes": 2097152,
            },
        ],
    }

    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Titan Technologies Ltd"
    assert data["risk_type"] == "D_AND_O"
    assert data["tracking_number"].startswith("FAC-")
    assert len(data["documents"]) == 2


def test_create_submission_validation_errors(client):
    # Invalid negative revenue
    invalid_payload = {
        "risk_type": "CYBER",
        "insured_name": "Invalid Corp",
        "industry_sector": "Retail",
        "annual_revenue": -1000.0,
        "primary_policy_limit": 1000000.0,
        "requested_reinsurance_limit": 500000.0,
        "attachment_point": 500000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    response = client.post("/api/v1/submissions", json=invalid_payload)
    assert response.status_code == 422

    # Expiration date before effective date
    invalid_dates_payload = {
        "risk_type": "CYBER",
        "insured_name": "Invalid Corp",
        "industry_sector": "Retail",
        "annual_revenue": 100000.0,
        "primary_policy_limit": 1000000.0,
        "requested_reinsurance_limit": 500000.0,
        "attachment_point": 500000.0,
        "policy_effective_date": "2027-01-01",
        "policy_expiration_date": "2026-01-01",
    }
    response = client.post("/api/v1/submissions", json=invalid_dates_payload)
    assert response.status_code == 422


def test_decline_reasons_endpoints(client):
    endpoints = [
        "/api/v1/submissions/decline-reasons",
        "/api/v1/submissions/reasons",
        "/api/v1/underwriting/decline-reasons",
        "/api/v1/underwriting/reasons",
        "/api/v1/decline-reasons",
        "/decline-reasons",
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 200, f"Failed for endpoint {ep}"
        data = res.json()
        assert isinstance(data, list)
        assert len(data) >= 5
        codes = [item["code"] for item in data]
        assert "HIGH_EXPOSURE_AGGREGATION" in codes
        assert "RISK_APPETITE_MISMATCH" in codes


def test_list_and_get_submissions(client):
    # Create submission
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Vortex Energy Inc",
        "industry_sector": "Utilities",
        "annual_revenue": 50000000.0,
        "primary_policy_limit": 5000000.0,
        "requested_reinsurance_limit": 2500000.0,
        "attachment_point": 2500000.0,
        "policy_effective_date": "2026-08-01",
        "policy_expiration_date": "2027-08-01",
    }
    create_res = client.post("/api/v1/submissions", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    sub_id = created["id"]

    # List submissions
    list_res = client.get("/api/v1/submissions?skip=0&limit=10")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert any(item["id"] == sub_id for item in list_data["items"])

    # Filter by risk type
    filtered_res = client.get("/api/v1/submissions?risk_type=CYBER")
    assert filtered_res.status_code == 200
    assert all(item["risk_type"] == "CYBER" for item in filtered_res.json()["items"])

    # Get single submission
    get_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["id"] == sub_id
    assert detail["insured_name"] == "Vortex Energy Inc"

    # Get not found
    nf_res = client.get("/api/v1/submissions/non-existent-uuid")
    assert nf_res.status_code == 404

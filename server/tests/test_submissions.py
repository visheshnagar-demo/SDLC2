def test_create_cyber_submission_snake_case(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "CyberTech Security Corp",
        "industry_sector": "Technology",
        "annual_revenue": 50000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 5000000.0,
        "policy_effective_date": "2026-02-01",
        "policy_expiration_date": "2027-02-01",
        "risk_profile": {
            "claims_count_3yr": 0,
            "total_losses_3yr": 0.0,
            "security_framework": "ISO 27001",
            "mfa_enforced": True,
            "backup_immutable": True,
        },
        "documents": [
            {
                "document_type": "SECURITY_AUDIT",
                "file_name": "iso27001_certificate.pdf",
                "file_size": 204800,
            }
        ],
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "CyberTech Security Corp"
    assert data["risk_type"] == "CYBER"
    assert data["tracking_number"].startswith("FAC-2026-CY-")
    assert "overall_risk_score" in data
    assert data["overall_risk_score"] > 0
    assert "risk_tier" in data


def test_create_d_and_o_submission_camel_case(client):
    payload = {
        "riskType": "D&O",
        "insuredName": "Meridian Holdings PLC",
        "industrySector": "Financial Services",
        "annualRevenue": 150000000.0,
        "primaryPolicyLimit": 25000000.0,
        "requestedReinsuranceLimit": 10000000.0,
        "attachmentPoint": 15000000.0,
        "policyEffectiveDate": "2026-03-01",
        "policyExpirationDate": "2027-03-01",
        "riskProfile": {
            "claimsCount3yr": 1,
            "totalLosses3yr": 250000.0,
            "boardGovernanceScore": 88.0,
            "regulatoryEnforcementAction": False,
            "esgRiskRating": "AA",
        },
        "documents": [
            {
                "documentType": "FINANCIAL_STATEMENTS",
                "fileName": "audited_financials_2025.pdf",
                "fileSize": 1048576,
            }
        ],
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insured_name"] == "Meridian Holdings PLC"
    assert data["risk_type"] == "D_AND_O"
    assert data["tracking_number"].startswith("FAC-2026-DO-")


def test_create_submission_empty_payload_fails_422(client):
    response = client.post("/api/v1/submissions", json={})
    assert response.status_code == 422


def test_create_submission_missing_required_fields_fails_422(client):
    response = client.post(
        "/api/v1/submissions",
        json={"insured_name": "Incomplete Submission Corp"},
    )
    assert response.status_code == 422


def test_missing_info_flagging_on_cyber_intake(client):
    # Submission without MFA and without documents
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Unprepared Logistics Ltd",
        "industry_sector": "Transportation",
        "annual_revenue": 20000000.0,
        "primary_policy_limit": 5000000.0,
        "requested_reinsurance_limit": 2000000.0,
        "attachment_point": 1000000.0,
        "policy_effective_date": "2026-04-01",
        "policy_expiration_date": "2027-04-01",
        "risk_profile": {
            "mfa_enforced": False,
        },
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "FLAGGED"
    assert data["missing_flags_count"] > 0
    flag_names = [f["field_or_document_name"] for f in data["missing_flags"]]
    assert "mfa_enforcement" in flag_names


def test_list_and_get_submissions(client):
    # Create submission
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Apex Global Financial Corp",
        "industry_sector": "Banking",
        "annual_revenue": 80000000.0,
        "primary_policy_limit": 20000000.0,
        "requested_reinsurance_limit": 8000000.0,
        "attachment_point": 12000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    create_res = client.post("/api/v1/submissions", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    sub_id = created["id"]
    tracking = created["tracking_number"]

    # List submissions
    list_res = client.get("/api/v1/submissions")
    assert list_res.status_code == 200
    items = list_res.json()
    assert isinstance(items, list)
    assert len(items) >= 1

    # Get by ID
    get_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == sub_id

    # Get by tracking number
    get_tracking_res = client.get(f"/api/v1/submissions/{tracking}")
    assert get_tracking_res.status_code == 200
    assert get_tracking_res.json()["tracking_number"] == tracking


def test_get_nonexistent_submission_returns_404(client):
    response = client.get("/api/v1/submissions/non-existent-uuid-12345")
    assert response.status_code == 404


def test_decline_reasons_catalogue(client):
    response = client.get("/api/v1/submissions/decline-reasons")
    assert response.status_code == 200
    reasons = response.json()
    assert isinstance(reasons, list)
    assert len(reasons) >= 5
    codes = [r["code"] for r in reasons]
    assert "HIGH_EXPOSURE_AGGREGATION" in codes
    assert "POOR_LOSS_HISTORY" in codes

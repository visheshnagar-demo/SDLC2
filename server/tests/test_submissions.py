def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_create_cyber_submission_success(client):
    payload = {
        "carrier_name": "Apex Insurance Mutual",
        "insured_name": "Globex Cyber Dynamics Corp",
        "risk_type": "CYBER",
        "primary_limit": 5000000.00,
        "attachment_point": 10000000.00,
        "ceded_limit": 5000000.00,
        "carrier_premium": 150000.00,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
        "cyber_profile": {
            "industry_sector": "Technology / SaaS",
            "record_count": 2500000,
            "has_mfa_email": True,
            "has_mfa_remote_access": True,
            "has_mfa_admin_accounts": False,  # Missing admin MFA -> Critical flag & penalty
            "has_edr_deployed": True,
            "has_immutable_backups": True,
            "prior_ransomware_claims": 0,
        },
    }

    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["submission_number"].startswith("FAC-")
    assert data["status"] in ["UNDER_REVIEW", "INFO_REQUESTED"]
    assert "risk_score" in data
    assert data["risk_score"]["calculated_score"] > 0
    assert data["missing_flags_count"] >= 1


def test_create_do_submission_success(client):
    payload = {
        "carrier_name": "Sentinel Risk Underwriters",
        "insured_name": "Acme Holdings LLC",
        "risk_type": "DO",
        "primary_limit": 10000000.00,
        "attachment_point": 15000000.00,
        "ceded_limit": 5000000.00,
        "carrier_premium": 250000.00,
        "policy_start_date": "2026-07-01",
        "policy_end_date": "2027-07-01",
        "do_profile": {
            "company_structure": "PUBLIC",
            "market_cap": 500000000.00,
            "debt_to_equity_ratio": 1.5,
            "executive_turnover_count": 2,
            "has_board_oversight_charter": True,
            "pending_litigation_flag": False,
            "prior_securities_claims": 0,
        },
    }

    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["submission_number"].startswith("FAC-")
    assert "risk_score" in data


def test_create_submission_invalid_dates_rejected(client):
    payload = {
        "carrier_name": "Apex Insurance Mutual",
        "insured_name": "Globex Cyber Dynamics Corp",
        "risk_type": "CYBER",
        "primary_limit": 5000000.00,
        "attachment_point": 10000000.00,
        "ceded_limit": 5000000.00,
        "carrier_premium": 150000.00,
        "policy_start_date": "2027-06-01",
        "policy_end_date": "2026-06-01",  # Invalid: end date before start date
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 422


def test_create_submission_negative_limit_rejected(client):
    payload = {
        "carrier_name": "Apex Insurance Mutual",
        "insured_name": "Globex Cyber Dynamics Corp",
        "risk_type": "CYBER",
        "primary_limit": -5000.00,  # Negative limit
        "attachment_point": 10000.00,
        "ceded_limit": 5000.00,
        "carrier_premium": 150.00,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 422


def test_get_submissions_queue_and_filter(client):
    # Create a cyber submission
    client.post("/api/v1/submissions", json={
        "carrier_name": "Carrier Alpha",
        "insured_name": "Insured Alpha",
        "risk_type": "CYBER",
        "primary_limit": 1000000.00,
        "attachment_point": 2000000.00,
        "ceded_limit": 1000000.00,
        "carrier_premium": 50000.00,
        "policy_start_date": "2026-01-01",
        "policy_end_date": "2027-01-01",
        "cyber_profile": {
            "industry_sector": "Finance",
            "record_count": 50000,
            "has_mfa_email": True,
            "has_mfa_remote_access": True,
            "has_mfa_admin_accounts": True,
            "has_edr_deployed": True,
            "has_immutable_backups": True,
            "prior_ransomware_claims": 0,
        }
    })

    # List queue
    response = client.get("/api/v1/submissions?risk_type=CYBER")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1
    assert data["items"][0]["risk_type"] == "CYBER"


def test_get_submission_detail_and_flags(client):
    create_resp = client.post("/api/v1/submissions", json={
        "carrier_name": "Carrier Beta",
        "insured_name": "Insured Beta",
        "risk_type": "CYBER",
        "primary_limit": 2000000.00,
        "attachment_point": 3000000.00,
        "ceded_limit": 1000000.00,
        "carrier_premium": 75000.00,
        "policy_start_date": "2026-02-01",
        "policy_end_date": "2027-02-01",
        "cyber_profile": {
            "industry_sector": "Healthcare",
            "record_count": 8000000,
            "has_mfa_email": False,
            "has_mfa_remote_access": False,
            "has_mfa_admin_accounts": False,
            "has_edr_deployed": False,
            "has_immutable_backups": False,
            "prior_ransomware_claims": 1,
        }
    })
    sub_id = create_resp.json()["id"]

    # Get Detail
    detail_resp = client.get(f"/api/v1/submissions/{sub_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["id"] == sub_id
    assert detail_data["cyber_profile"] is not None
    assert detail_data["risk_score"] is not None
    assert len(detail_data["flags"]) > 0

    # Get Flags
    flags_resp = client.get(f"/api/v1/submissions/{sub_id}/flags")
    assert flags_resp.status_code == 200
    flags_data = flags_resp.json()
    assert flags_data["submission_id"] == sub_id
    assert len(flags_data["flags"]) > 0

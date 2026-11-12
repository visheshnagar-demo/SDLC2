def test_root_and_health_endpoints(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"

    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"


def test_create_cyber_submission(client):
    payload = {
        "carrier_name": "Acme Underwriting Mutual",
        "insured_name": "CyberTech Solutions Inc",
        "risk_type": "Cyber",
        "limit": 5000000.0,
        "attachment_point": 10000000.0,
        "premium": 150000.0,
        "mfa_enabled": True,
        "edr_implemented": True,
        "offline_backups": True,
        "encryption_at_rest": True,
        "record_count": 500000,
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["id"] is not None
    assert data["risk_type"] == "Cyber"
    assert data["status"] == "PENDING"
    assert isinstance(data["risk_score"], float)
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_tier"] in ("LOW", "MEDIUM", "HIGH")


def test_create_cyber_submission_variants(client):
    for r_type in ["cyber", "CYBER", "Cyber", "Cyber Risk"]:
        payload = {
            "carrier_name": "Acme Underwriting Mutual",
            "insured_name": f"Test {r_type} Corp",
            "risk_type": r_type,
            "primary_limit": 5000000.0,
            "attachment_point": 10000000.0,
            "ceded_limit": 2500000.0,
            "carrier_premium": 150000.0,
            "policy_start_date": "2026-08-01",
            "policy_end_date": "2027-08-01",
        }
        res = client.post("/api/v1/submissions", json=payload)
        assert res.status_code in [200, 201]
        assert res.json()["risk_type"] == "Cyber"


def test_create_cyber_submission_success(client):
    payload = {
        "carrier_name": "Acme Underwriting Mutual",
        "insured_name": "CyberTech Solutions Inc",
        "risk_type": "CYBER",
        "primary_limit": 5000000.0,
        "attachment_point": 10000000.0,
        "ceded_limit": 2500000.0,
        "carrier_premium": 150000.0,
        "policy_start_date": "2026-08-01",
        "policy_end_date": "2027-08-01",
        "cyber_profile": {
            "mfa_enabled": True,
            "edr_implemented": True,
            "offline_backups": True,
            "encryption_at_rest": True,
            "record_count": 500000,
            "prior_ransomware_claims": False,
            "prior_claims_amount": 0.0,
            "security_training": True,
        },
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["id"] is not None
    assert data["carrier_name"] == "Acme Underwriting Mutual"
    assert data["insured_name"] == "CyberTech Solutions Inc"
    assert data["risk_type"] == "Cyber"
    assert data["status"] == "PENDING"
    assert isinstance(data["risk_score"], float)
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_tier"] in ("LOW", "MEDIUM", "HIGH")
    assert data["cyber_profile"] is not None
    assert data["cyber_profile"]["mfa_enabled"] is True


def test_create_do_submission(client):
    payload = {
        "carrier_name": "Sentinel Risk Partners",
        "insured_name": "Apex Global BioTech Corp",
        "risk_type": "D&O",
        "limit": 15000000.0,
        "attachment_point": 25000000.0,
        "premium": 320000.0,
        "leverage_ratio": 3.8,
        "executive_turnover_rate": 22.0,
        "active_litigation": True,
        "litigation_details": "Shareholder class action lawsuit pending in Delaware Court of Chancery",
        "independent_board_charter": False,
        "regulatory_investigations": True,
        "annual_revenue": 120000000.0,
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["id"] is not None
    assert data["risk_type"] == "D&O"
    assert data["risk_score"] > 60.0
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_tier"] in ("MEDIUM", "HIGH")


def test_create_do_submission_variants(client):
    for r_type in [
        "DO",
        "do",
        "Do",
        "D&O",
        "d&o",
        "D & O",
        "D_AND_O",
        "Directors & Officers",
    ]:
        payload = {
            "carrier_name": "Sentinel Risk Partners",
            "insured_name": f"Test {r_type} Corp",
            "risk_type": r_type,
            "primary_limit": 10000000.0,
            "attachment_point": 5000000.0,
            "ceded_limit": 5000000.0,
            "carrier_premium": 200000.0,
            "policy_start_date": "2026-07-01",
            "policy_end_date": "2027-07-01",
        }
        res = client.post("/api/v1/submissions", json=payload)
        assert res.status_code in [200, 201]
        assert res.json()["risk_type"] == "D&O"


def test_do_high_executive_turnover_risk_score(client):
    payload = {
        "carrier_name": "Sentinel Risk Partners",
        "insured_name": "Turnover Tech Inc",
        "risk_type": "DO",
        "primary_limit": 10000000.0,
        "attachment_point": 5000000.0,
        "ceded_limit": 8000000.0,
        "carrier_premium": 200000.0,
        "do_profile": {
            "executive_turnover_rate": 30.0,
            "leverage_ratio": 2.0,
            "independent_board_charter": False,
        },
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["risk_type"] == "D&O"
    assert data["risk_score"] >= 70.0
    assert data["risk_tier"] == "HIGH"


def test_missing_info_cyber_mfa_flagged(client):
    payload = {
        "carrier_name": "Flag Test Mutual",
        "insured_name": "No MFA Corp",
        "risk_type": "CYBER",
        "primary_limit": 5000000.0,
        "attachment_point": 10000000.0,
        "carrier_premium": 150000.0,
        "cyber_profile": {
            "mfa_enabled": False,
            "offline_backups": True,
        },
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["risk_type"] == "Cyber"
    flags = data["flags"]
    flag_codes = [f["flag_code"] for f in flags]
    assert "MISSING_MFA_DETAILS" in flag_codes


def test_tc05_underwriter_review_queue_scores(client):
    # Ensure underwriter review queue endpoint correctly returns calculated risk_score (0-100) and is sorted by risk score descending
    # Create multiple submissions with different risk profiles
    low_risk = {
        "carrier_name": "Carrier Alpha",
        "insured_name": "Low Risk Firm",
        "risk_type": "Cyber",
        "primary_limit": 1000000.0,
        "attachment_point": 5000000.0,
        "ceded_limit": 500000.0,
        "carrier_premium": 30000.0,
        "cyber_profile": {
            "mfa_enabled": True,
            "edr_implemented": True,
            "offline_backups": True,
            "encryption_at_rest": True,
            "record_count": 50000,
            "prior_ransomware_claims": False,
        },
    }
    high_risk = {
        "carrier_name": "Carrier Beta",
        "insured_name": "High Risk Firm",
        "risk_type": "Cyber",
        "primary_limit": 10000000.0,
        "attachment_point": 2000000.0,
        "ceded_limit": 9000000.0,
        "carrier_premium": 500000.0,
        "cyber_profile": {
            "mfa_enabled": False,
            "edr_implemented": False,
            "offline_backups": False,
            "record_count": 10000000,
            "prior_ransomware_claims": True,
            "prior_claims_amount": 2000000.0,
        },
    }
    client.post("/api/v1/submissions", json=low_risk)
    client.post("/api/v1/submissions", json=high_risk)

    # Query review queue endpoints
    for endpoint in [
        "/api/v1/submissions",
        "/api/v1/underwriting/queue",
        "/api/v1/queue",
    ]:
        res = client.get(endpoint)
        assert res.status_code == 200
        data = res.json()
        items = data["items"] if "items" in data else data
        assert len(items) >= 2
        for item in items:
            assert "risk_score" in item
            assert 0.0 <= item["risk_score"] <= 100.0
            assert item["risk_type"] in ("Cyber", "D&O")

        scores = [item["risk_score"] for item in items]
        assert scores == sorted(scores, reverse=True)


def test_tc07_missing_info_cyber_mfa_flagged(client):
    # Ensure automated missing info flags for Cyber (e.g. MFA, ransomware controls) are generated and returned in flags endpoints / submission model
    payload = {
        "carrier_name": "Cyber Sentinel",
        "insured_name": "Missing Controls Corp",
        "risk_type": "Cyber",
        "primary_limit": 5000000.0,
        "attachment_point": 10000000.0,
        "carrier_premium": 150000.0,
        "cyber_profile": {
            "mfa_enabled": False,
            "offline_backups": False,
            "edr_implemented": False,
        },
    }
    create_res = client.post("/api/v1/submissions", json=payload)
    assert create_res.status_code in [200, 201]
    data = create_res.json()
    assert data["risk_type"] == "Cyber"
    sub_id = data["id"]

    # Check flags in submission model
    flags_in_sub = data["flags"]
    flag_codes = [f["flag_code"] for f in flags_in_sub]
    descriptions = [f["description"] for f in flags_in_sub]
    assert "MISSING_MFA_DETAILS" in flag_codes
    assert any("MFA" in d for d in descriptions)
    assert "MISSING_BACKUP_CONTROLS" in flag_codes or any(
        "Backup" in d or "Ransomware" in d for d in descriptions
    )

    # Check dedicated flags endpoint
    flags_res = client.get(f"/api/v1/submissions/{sub_id}/flags")
    assert flags_res.status_code == 200
    flag_list = flags_res.json()
    direct_codes = [f["flag_code"] for f in flag_list]
    assert "MISSING_MFA_DETAILS" in direct_codes


def test_tc08_missing_info_do_disclosures_flagged(client):
    # Ensure automated missing info flags for D&O disclosures are generated and returned in flags endpoints / submission model
    payload = {
        "carrier_name": "Executive Mutual",
        "insured_name": "Incomplete DO Corp",
        "risk_type": "D&O",
        "primary_limit": 10000000.0,
        "attachment_point": 15000000.0,
        "carrier_premium": 250000.0,
        "do_profile": {
            "independent_board_charter": False,
            "active_litigation": True,
            "litigation_details": "",
        },
    }
    create_res = client.post("/api/v1/submissions", json=payload)
    assert create_res.status_code in [200, 201]
    data = create_res.json()
    assert data["risk_type"] == "D&O"
    sub_id = data["id"]

    # Check flags in submission model
    flags_in_sub = data["flags"]
    flag_codes = [f["flag_code"] for f in flags_in_sub]
    assert (
        "MISSING_BOARD_GOVERNANCE" in flag_codes
        or "MISSING_BOARD_OVERSIGHT" in flag_codes
        or any("Board" in f["description"] for f in flags_in_sub)
    )

    # Check dedicated flags endpoint
    flags_res = client.get(f"/api/v1/submissions/{sub_id}/flags")
    assert flags_res.status_code == 200
    flag_list = flags_res.json()
    assert len(flag_list) > 0


def test_create_submission_negative_limits_rejected(client):
    payload = {
        "carrier_name": "Test Carrier",
        "insured_name": "Bad Limit Corp",
        "risk_type": "CYBER",
        "primary_limit": -5000.0,
        "attachment_point": 10000.0,
        "ceded_limit": 2500.0,
        "carrier_premium": 150.0,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 422


def test_create_submission_invalid_dates_rejected(client):
    payload = {
        "carrier_name": "Test Carrier",
        "insured_name": "Bad Dates Corp",
        "risk_type": "CYBER",
        "primary_limit": 5000000.0,
        "attachment_point": 10000000.0,
        "ceded_limit": 2500000.0,
        "carrier_premium": 150000.0,
        "policy_start_date": "2027-06-01",
        "policy_end_date": "2026-06-01",  # End before start
    }
    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 422


def test_create_submission_invalid_risk_type_rejected(client):
    for bad_type in ["PROPERTY", "AUTO", "TORNADO", "CASUALTY", "INDOOR"]:
        payload = {
            "carrier_name": "Test Carrier",
            "insured_name": "Invalid Type Corp",
            "risk_type": bad_type,
            "primary_limit": 5000000.0,
            "attachment_point": 10000000.0,
            "ceded_limit": 2500000.0,
            "carrier_premium": 150000.0,
            "policy_start_date": "2026-06-01",
            "policy_end_date": "2027-06-01",
        }
        response = client.post("/api/v1/submissions", json=payload)
        assert response.status_code == 422


def test_list_and_filter_submissions(client):
    response = client.get("/api/v1/submissions")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1

    # Filter by risk type CYBER / cyber / Cyber
    for r_filter in ["CYBER", "cyber", "Cyber"]:
        res_cyber = client.get(f"/api/v1/submissions?risk_type={r_filter}")
        assert res_cyber.status_code == 200
        for item in res_cyber.json()["items"]:
            assert item["risk_type"] == "Cyber"

    # Filter by risk type DO / D&O / d&o
    for r_filter in ["DO", "do", "D&O", "d&o"]:
        res_do = client.get(f"/api/v1/submissions?risk_type={r_filter}")
        assert res_do.status_code == 200
        for item in res_do.json()["items"]:
            assert item["risk_type"] == "D&O"

    # Filter by min_score
    res_score = client.get("/api/v1/submissions?min_score=50.0")
    assert res_score.status_code == 200
    for item in res_score.json()["items"]:
        assert item["risk_score"] >= 50.0


def test_get_submission_detail_and_flags(client):
    payload = {
        "carrier_name": "Flag Test Mutual",
        "insured_name": "Unprotected Corp",
        "risk_type": "CYBER",
        "primary_limit": 2000000.0,
        "attachment_point": 5000000.0,
        "ceded_limit": 1000000.0,
        "carrier_premium": 80000.0,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
        "cyber_profile": {
            "mfa_enabled": False,
            "edr_implemented": False,
            "offline_backups": False,
            "encryption_at_rest": False,
        },
    }
    create_res = client.post("/api/v1/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Retrieve submission by id
    get_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_res.status_code == 200
    sub_data = get_res.json()
    assert sub_data["id"] == sub_id
    assert sub_data["risk_type"] == "Cyber"
    assert len(sub_data["flags"]) > 0

    # Check flags endpoint directly
    flags_res = client.get(f"/api/v1/submissions/{sub_id}/flags")
    assert flags_res.status_code == 200
    flags = flags_res.json()
    flag_codes = [f["flag_code"] for f in flags]
    assert "MISSING_MFA_DETAILS" in flag_codes
    assert "MISSING_BACKUP_CONTROLS" in flag_codes


def test_get_nonexistent_submission(client):
    res = client.get("/api/v1/submissions/non-existent-uuid-1234")
    assert res.status_code == 404

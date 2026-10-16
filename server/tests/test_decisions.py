def test_quote_decision_flow(client):
    # 1. Create submission
    payload = {
        "carrier_id": "CARRIER-DEC-1",
        "carrier_name": "Hannover Re Americas",
        "insured_name": "Apex Enterprise Cloud",
        "industry_sector": "Technology",
        "annual_revenue": 100000000.0,
        "risk_type": "CYBER",
        "requested_limit": 10000000.0,
        "attachment_point": 1000000.0,
        "policy_effective_date": "2026-11-01",
        "policy_expiration_date": "2027-11-01",
    }
    create_res = client.post("/api/v1/reinsurance/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # 2. Quote decision
    quote_payload = {
        "submission_id": sub_id,
        "decision_type": "QUOTE",
        "underwriter_id": "UW-501",
        "underwriter_name": "Elena Rostova",
        "quoted_premium": 115000.0,
        "quoted_limit": 10000000.0,
        "quoted_attachment_point": 1000000.0,
        "subjectivities": "Subject to verified clean loss runs and MFA attestation prior to inception.",
    }
    dec_res = client.post("/api/v1/reinsurance/underwriting/decisions", json=quote_payload)
    assert dec_res.status_code == 201
    dec_data = dec_res.json()
    assert dec_data["decision_type"] == "QUOTE"
    assert dec_data["quoted_premium"] == 115000.0

    # 3. Check updated submission status
    sub_res = client.get(f"/api/v1/reinsurance/submissions/{sub_id}")
    assert sub_res.status_code == 200
    assert sub_res.json()["status"] == "QUOTED"
    assert len(sub_res.json()["decisions"]) == 1


def test_quote_decision_validation_errors(client):
    # Missing premium
    quote_payload = {
        "submission_id": "non-existent-id",
        "decision_type": "QUOTE",
        "underwriter_id": "UW-501",
        "underwriter_name": "Elena Rostova",
        "quoted_premium": 0.0,  # invalid
        "quoted_limit": 5000000.0,
        "quoted_attachment_point": 500000.0,
    }
    dec_res = client.post("/api/v1/reinsurance/underwriting/decisions", json=quote_payload)
    assert dec_res.status_code in [400, 404]


def test_decline_decision_flow(client):
    # 1. Create submission
    payload = {
        "carrier_id": "CARRIER-DEC-2",
        "carrier_name": "Munich Re Syndicate",
        "insured_name": "High Risk Heavy Mining Corp",
        "industry_sector": "Mining",
        "annual_revenue": 300000000.0,
        "risk_type": "D_AND_O",
        "requested_limit": 25000000.0,
        "attachment_point": 2000000.0,
        "policy_effective_date": "2026-11-01",
        "policy_expiration_date": "2027-11-01",
    }
    create_res = client.post("/api/v1/reinsurance/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # 2. Decline decision
    decline_payload = {
        "submission_id": sub_id,
        "decision_type": "DECLINE",
        "underwriter_id": "UW-502",
        "underwriter_name": "Marcus Vance",
        "decline_reason_code": "OUTSIDE_APPETITE",
        "decline_notes": "Risk profile and litigation frequency exceed current reinsurance capacity appetite.",
    }
    dec_res = client.post("/api/v1/reinsurance/underwriting/decisions", json=decline_payload)
    assert dec_res.status_code == 201
    assert dec_res.json()["decision_type"] == "DECLINE"

    # 3. Check updated status
    sub_res = client.get(f"/api/v1/reinsurance/submissions/{sub_id}")
    assert sub_res.json()["status"] == "DECLINED"


def test_decline_missing_reason_code_error(client):
    # 1. Create submission
    payload = {
        "carrier_id": "CARRIER-DEC-3",
        "carrier_name": "Swiss Re Partner",
        "insured_name": "Omega BioTech Inc",
        "industry_sector": "Biotech",
        "annual_revenue": 50000000.0,
        "risk_type": "D_AND_O",
        "requested_limit": 10000000.0,
        "attachment_point": 1000000.0,
        "policy_effective_date": "2026-11-01",
        "policy_expiration_date": "2027-11-01",
    }
    create_res = client.post("/api/v1/reinsurance/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # 2. Decline without reason code
    decline_payload = {
        "submission_id": sub_id,
        "decision_type": "DECLINE",
        "underwriter_id": "UW-503",
        "underwriter_name": "Marcus Vance",
        "decline_reason_code": "",  # Empty
    }
    dec_res = client.post("/api/v1/reinsurance/underwriting/decisions", json=decline_payload)
    assert dec_res.status_code == 400

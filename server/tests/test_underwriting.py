def test_get_decline_reasons_catalogue(client):
    # Test primary endpoint
    res1 = client.get("/api/v1/underwriting/reasons")
    assert res1.status_code == 200
    data1 = res1.json()
    assert isinstance(data1, list)
    assert len(data1) > 0
    codes1 = [r["code"] for r in data1]
    assert "HIGH_EXPOSURE_AGGREGATION" in codes1
    assert "INSUFFICIENT_SECURITY_CONTROLS" in codes1

    # Test explicit endpoint
    res2 = client.get("/api/v1/underwriting/decline-reasons")
    assert res2.status_code == 200
    assert isinstance(res2.json(), list)
    assert len(res2.json()) == len(data1)

    # Test alias on submissions router
    res3 = client.get("/api/v1/submissions/decline-reasons")
    assert res3.status_code == 200
    assert isinstance(res3.json(), list)
    assert len(res3.json()) == len(data1)

    # Test root api path
    res4 = client.get("/api/v1/decline-reasons")
    assert res4.status_code == 200
    assert isinstance(res4.json(), list)


def test_record_quote_decision(client):
    # 1. Create a submission
    sub_payload = {
        "carrier_name": "Liberty Mutual Re",
        "insured_name": "Apex Cloud Systems",
        "risk_type": "CYBER",
        "primary_limit": 10000000.0,
        "attachment_point": 20000000.0,
        "ceded_limit": 5000000.0,
        "carrier_premium": 250000.0,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
        "cyber_profile": {
            "mfa_enabled": True,
            "edr_implemented": True,
            "offline_backups": True,
            "encryption_at_rest": True,
            "record_count": 100000,
        },
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    assert create_res.status_code in [200, 201]
    sub_id = create_res.json()["id"]

    # 2. Record a Quote decision
    quote_payload = {
        "decision_type": "QUOTE",
        "offered_capacity": 2500000.0,
        "quoted_rate": 3.25,
        "quoted_premium": 81250.0,
        "terms_conditions": "Subject to annual third-party cybersecurity penetration audit",
        "exclusions": [
            "War, Invasion, and Hostilities Exclusion",
            "Critical Infrastructure Failure",
        ],
    }
    decision_res = client.post(
        f"/api/v1/submissions/{sub_id}/decisions", json=quote_payload
    )
    assert decision_res.status_code in [200, 201]
    decision_data = decision_res.json()
    assert decision_data["submission_id"] == sub_id
    assert decision_data["decision_type"] == "QUOTE"
    assert decision_data["offered_capacity"] == 2500000.0
    assert decision_data["quoted_rate"] == 3.25

    # 3. Check updated submission status
    get_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "QUOTED"
    assert len(get_res.json()["decisions"]) >= 1


def test_record_decline_decision(client):
    # 1. Create a submission
    sub_payload = {
        "carrier_name": "Travelers Casualty Re",
        "insured_name": "High Risk Holdings LLC",
        "risk_type": "DO",
        "primary_limit": 20000000.0,
        "attachment_point": 10000000.0,
        "ceded_limit": 10000000.0,
        "carrier_premium": 400000.0,
        "policy_start_date": "2026-07-01",
        "policy_end_date": "2027-07-01",
        "do_profile": {
            "leverage_ratio": 5.5,
            "executive_turnover_rate": 35.0,
            "active_litigation": True,
            "litigation_details": "Multiple SEC accounting investigations",
            "independent_board_charter": False,
        },
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    assert create_res.status_code in [200, 201]
    sub_id = create_res.json()["id"]

    # 2. Record Decline decision
    decline_payload = {
        "decision_type": "DECLINE",
        "decline_reason_code": "HIGH_EXPOSURE_AGGREGATION",
        "decline_notes": "Exceeds underwriting risk tolerance for corporate governance and financial leverage.",
    }
    decision_res = client.post(
        f"/api/v1/submissions/{sub_id}/decisions", json=decline_payload
    )
    assert decision_res.status_code in [200, 201]
    decision_data = decision_res.json()
    assert decision_data["decision_type"] == "DECLINE"
    assert decision_data["decline_reason_code"] == "HIGH_EXPOSURE_AGGREGATION"

    # 3. Check updated submission status
    get_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "DECLINED"


def test_decline_decision_without_reason_rejected(client):
    sub_payload = {
        "carrier_name": "Test Mutual",
        "insured_name": "Sample Insured",
        "risk_type": "CYBER",
        "primary_limit": 1000000.0,
        "attachment_point": 1000000.0,
        "ceded_limit": 500000.0,
        "carrier_premium": 50000.0,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    sub_id = create_res.json()["id"]

    # Decline without code
    payload = {"decision_type": "DECLINE"}
    res = client.post(f"/api/v1/submissions/{sub_id}/decisions", json=payload)
    assert res.status_code in [400, 422]


def test_decline_decision_invalid_code_fails(client):
    sub_payload = {
        "carrier_name": "Test Mutual",
        "insured_name": "Sample Insured",
        "risk_type": "CYBER",
        "primary_limit": 1000000.0,
        "attachment_point": 1000000.0,
        "ceded_limit": 500000.0,
        "carrier_premium": 50000.0,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    sub_id = create_res.json()["id"]

    payload = {
        "decision_type": "DECLINE",
        "decline_reason_code": "NON_EXISTENT_CODE_XYZ",
    }
    res = client.post(f"/api/v1/submissions/{sub_id}/decisions", json=payload)
    assert res.status_code == 400


def test_underwriting_namespace_decision_endpoint(client):
    sub_payload = {
        "carrier_name": "Namespace Mutual",
        "insured_name": "Namespace Insured",
        "risk_type": "CYBER",
        "primary_limit": 1000000.0,
        "attachment_point": 1000000.0,
        "ceded_limit": 500000.0,
        "carrier_premium": 50000.0,
        "policy_start_date": "2026-06-01",
        "policy_end_date": "2027-06-01",
    }
    create_res = client.post("/api/v1/submissions", json=sub_payload)
    sub_id = create_res.json()["id"]

    payload = {
        "decision_type": "QUOTE",
        "offered_capacity": 500000.0,
        "quoted_rate": 4.0,
    }
    res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions", json=payload
    )
    assert res.status_code in [200, 201]
    assert res.json()["decision_type"] == "QUOTE"

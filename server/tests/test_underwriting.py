def test_underwriting_queue_and_filters(client):
    # Create Cyber submission
    cyber_payload = {
        "risk_type": "CYBER",
        "insured_name": "Cyber Shield Corp",
        "industry_sector": "Technology",
        "annual_revenue": 30000000.0,
        "primary_policy_limit": 10000000.0,
        "requested_reinsurance_limit": 4000000.0,
        "attachment_point": 6000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    client.post("/api/v1/submissions", json=cyber_payload)

    # Create D&O submission
    do_payload = {
        "risk_type": "D_AND_O",
        "insured_name": "Executive Holdings Ltd",
        "industry_sector": "Healthcare",
        "annual_revenue": 90000000.0,
        "primary_policy_limit": 20000000.0,
        "requested_reinsurance_limit": 8000000.0,
        "attachment_point": 12000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    client.post("/api/v1/submissions", json=do_payload)

    # Query full queue
    queue_res = client.get("/api/v1/underwriting/queue")
    assert queue_res.status_code == 200
    items = queue_res.json()
    assert len(items) >= 2

    # Filter by risk_type
    cyber_queue = client.get("/api/v1/underwriting/queue?risk_type=CYBER")
    assert cyber_queue.status_code == 200
    for item in cyber_queue.json():
        assert item["risk_type"] == "CYBER"


def test_recompute_risk_score(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Vanguard Tech Systems",
        "industry_sector": "Software",
        "annual_revenue": 45000000.0,
        "primary_policy_limit": 15000000.0,
        "requested_reinsurance_limit": 5000000.0,
        "attachment_point": 10000000.0,
        "policy_effective_date": "2026-05-01",
        "policy_expiration_date": "2027-05-01",
    }
    created = client.post("/api/v1/submissions", json=payload).json()
    sub_id = created["id"]

    score_res = client.post(f"/api/v1/underwriting/submissions/{sub_id}/score")
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert "composite_score" in score_data
    assert score_data["composite_score"] > 0
    assert "risk_tier" in score_data


def test_resolve_missing_information_flag(client):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "Incomplete Logistics Co",
        "industry_sector": "Logistics",
        "annual_revenue": 25000000.0,
        "primary_policy_limit": 5000000.0,
        "requested_reinsurance_limit": 2000000.0,
        "attachment_point": 1000000.0,
        "policy_effective_date": "2026-01-01",
        "policy_expiration_date": "2027-01-01",
    }
    created = client.post("/api/v1/submissions", json=payload).json()
    sub_id = created["id"]
    assert len(created["missing_flags"]) > 0
    flag_id = created["missing_flags"][0]["id"]

    resolve_res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/flags/{flag_id}/resolve"
    )
    assert resolve_res.status_code == 200
    flag_data = resolve_res.json()
    assert flag_data["is_resolved"] is True

def test_decline_decision(client):
    # Create submission with missing info
    sub_res = client.post(
        "/api/v1/reinsurance-requests",
        json={
            "carrier_name": "Apex Underwriters",
            "carrier_rating": "A",
            "risk_category": "DO",
            "policy_limit_usd": 25000000.0,
            "attachment_point_usd": 10000000.0,
            "effective_date": "2026-06-01",
            "expiration_date": "2027-06-01",
            "primary_policy_number": "POL-DO-9921",
            "insured_entity_name": "Venture Crypto Corp",
            "industry_sector": "Cryptocurrency & Blockchain",
            "prior_loss_amount_usd": 1200000.0,
        },
    )
    assert sub_res.status_code == 201
    sub_id = sub_res.json()["id"]

    # Decline it
    dec_res = client.post(
        "/api/v1/underwriting/decisions",
        json={
            "submission_id": sub_id,
            "underwriter_id": "UW-4021",
            "decision": "DECLINE",
            "decline_reason_code": "EXCEEDS_RISK_APPETITE",
            "notes": "Exceeds D&O risk appetite due to speculative crypto market litigation risks.",
        },
    )
    assert dec_res.status_code == 201
    dec_data = dec_res.json()
    assert dec_data["decision"] == "DECLINE"
    assert dec_data["status"] == "DECLINED"
    assert dec_data["decline_reason_code"] == "EXCEEDS_RISK_APPETITE"

    # Verify status in queue/detail
    detail_res = client.get(f"/api/v1/reinsurance-requests/{sub_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["status"] == "DECLINED"


def test_quote_blocked_when_missing_flags_and_succeeds_after_resolution(client):
    # Create submission without mandatory documents
    sub_res = client.post(
        "/api/v1/reinsurance-requests",
        json={
            "carrier_name": "Hartford Casualty",
            "carrier_rating": "A+",
            "risk_category": "CYBER",
            "policy_limit_usd": 10000000.0,
            "attachment_point_usd": 5000000.0,
            "effective_date": "2026-06-01",
            "expiration_date": "2027-06-01",
            "primary_policy_number": "POL-CYB-7722",
            "insured_entity_name": "HealthGrid Systems",
            "industry_sector": "Healthcare IT",
            "prior_loss_amount_usd": 0.0,
            "attached_documents": [],
        },
    )
    assert sub_res.status_code == 201
    sub_id = sub_res.json()["id"]

    # 1. Attempt quote while flags are blocking -> must fail with 422
    quote_payload = {
        "submission_id": sub_id,
        "underwriter_id": "UW-9921",
        "decision": "QUOTE",
        "quoted_premium_usd": 120000.0,
        "quoted_limit_usd": 10000000.0,
        "quoted_attachment_usd": 5000000.0,
        "notes": "Binding quote subject to standard terms.",
    }
    blocked_res = client.post("/api/v1/underwriting/decisions", json=quote_payload)
    assert blocked_res.status_code == 422
    assert "blocking missing information flags" in blocked_res.json()["detail"]

    # 2. Fetch flags and resolve them
    detail_res = client.get(f"/api/v1/reinsurance-requests/{sub_id}")
    assert detail_res.status_code == 200
    flags = detail_res.json()["missing_flags"]
    assert len(flags) > 0

    for flag in flags:
        resolve_res = client.patch(
            f"/api/v1/underwriting/flags/{flag['id']}/resolve",
            json={"underwriter_id": "UW-9921"},
        )
        assert resolve_res.status_code == 200
        assert resolve_res.json()["is_resolved"] is True

    # 3. Quote again -> now should succeed
    success_quote_res = client.post(
        "/api/v1/underwriting/decisions", json=quote_payload
    )
    assert success_quote_res.status_code == 201
    quote_data = success_quote_res.json()
    assert quote_data["decision"] == "QUOTE"
    assert quote_data["status"] == "QUOTED"
    assert quote_data["quoted_premium_usd"] == 120000.0

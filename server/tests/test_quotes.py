def test_create_quote_and_terms_calculation(client, underwriter_headers):
    # Create submission ($4M limit <= $5M authority, $350k premium)
    res = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Calculated Quote Corp",
            "line_of_business": "CYBER",
            "policy_limit": 4000000.0,
            "attachment_point": 1000000.0,
            "retention": 200000.0,
            "proposed_premium": 350000.0,
            "effective_date": "2026-11-01",
            "expiry_date": "2027-11-01",
        },
        headers=underwriter_headers,
    )
    sub_id = res.json()["id"]

    # Issue Quote: 50% share offered, 20% ceding commission
    quote_res = client.post(
        f"/api/v1/submissions/{sub_id}/quotes",
        json={
            "share_offered_pct": 50.0,
            "ceding_commission_pct": 20.0,
            "conditions": "Subject to receipt of signed cyber application within 14 days",
            "exclusions": ["War & Cyber Terrorism LMA5391", "Infrastructure Outage"],
            "valid_until": "2026-12-01",
        },
        headers=underwriter_headers,
    )
    assert quote_res.status_code == 201
    q_data = quote_res.json()
    assert q_data["share_offered_pct"] == 50.0
    assert q_data["reinsurance_exposed_limit"] == 2000000.0  # 4M * 0.5
    assert q_data["ceding_commission_pct"] == 20.0
    assert q_data["proposed_gross_premium"] == 350000.0
    assert q_data["gross_reinsurance_premium"] == 175000.0  # 350k * 0.5
    assert q_data["reinsurance_premium"] == 140000.0  # 175k * (1 - 0.20)
    assert len(q_data["exclusions"]) == 2

    # Verify submission status updated to QUOTED
    sub_res = client.get(f"/api/v1/submissions/{sub_id}", headers=underwriter_headers)
    assert sub_res.json()["status"] == "QUOTED"
    assert sub_res.json()["latest_quote"]["quote_number"] == q_data["quote_number"]

    # Verify quotes listing
    quotes_list = client.get(
        f"/api/v1/submissions/{sub_id}/quotes", headers=underwriter_headers
    )
    assert quotes_list.status_code == 200
    assert len(quotes_list.json()) >= 1

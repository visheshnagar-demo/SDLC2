def test_manager_dashboard_analytics(client, manager_headers, underwriter_headers):
    # Create several submissions across lines and statuses
    sub1 = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Analytics Cyber Inc",
            "line_of_business": "CYBER",
            "policy_limit": 5000000.0,
            "attachment_point": 1000000.0,
            "retention": 200000.0,
            "proposed_premium": 200000.0,
            "effective_date": "2026-11-01",
            "expiry_date": "2027-11-01",
        },
        headers=underwriter_headers,
    ).json()

    # Move sub1 to IN_REVIEW first
    client.patch(
        f"/api/v1/submissions/{sub1['id']}/status",
        json={"target_status": "IN_REVIEW"},
        headers=underwriter_headers,
    )

    # Move sub1 to QUOTED via quote
    client.post(
        f"/api/v1/submissions/{sub1['id']}/quotes",
        json={"share_offered_pct": 50.0, "ceding_commission_pct": 20.0},
        headers=underwriter_headers,
    )

    # Bind sub1
    client.post(
        f"/api/v1/submissions/{sub1['id']}/decisions",
        json={"decision": "BOUND"},
        headers=underwriter_headers,
    )

    # Create sub2 referred to manager
    sub2 = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "TNS-104",
            "insured_name": "Analytics High Limit DO",
            "line_of_business": "DO",
            "policy_limit": 12000000.0,
            "attachment_point": 2000000.0,
            "retention": 500000.0,
            "proposed_premium": 400000.0,
            "effective_date": "2026-11-01",
            "expiry_date": "2027-11-01",
        },
        headers=underwriter_headers,
    ).json()

    # Move sub2 to IN_REVIEW
    client.patch(
        f"/api/v1/submissions/{sub2['id']}/status",
        json={"target_status": "IN_REVIEW"},
        headers=underwriter_headers,
    )

    # Trigger referral (attempting to QUOTE high-limit triggers REFERRED_TO_MANAGER)
    client.patch(
        f"/api/v1/submissions/{sub2['id']}/status",
        json={"target_status": "QUOTED"},
        headers=underwriter_headers,
    )

    # Fetch manager dashboard
    dash_res = client.get(
        "/api/v1/analytics/manager-dashboard", headers=manager_headers
    )
    assert dash_res.status_code == 200
    dash_data = dash_res.json()

    assert "total_capacity_exposed" in dash_data
    assert "quote_to_bind_ratio" in dash_data
    assert "submissions_by_status" in dash_data
    assert "lob_breakdown" in dash_data
    assert "pending_referrals" in dash_data
    assert dash_data["submissions_by_status"]["BOUND"] >= 1
    assert dash_data["submissions_by_status"]["REFERRED_TO_MANAGER"] >= 1
    assert len(dash_data["pending_referrals"]) >= 1
    assert any(
        ref["submission_id"] == sub2["id"] for ref in dash_data["pending_referrals"]
    )

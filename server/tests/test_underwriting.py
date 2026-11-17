def test_underwriter_queue_filtering_and_sorting(
    client, carrier_token, underwriter_token
):
    # AC: Underwriter Review Queue & Dashboard: Centralized workbench with filtering, sorting, and priority views
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    uw_headers = {"Authorization": f"Bearer {underwriter_token}"}

    # Submit 1 Low risk and 1 High risk
    client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "Low Risk Tech Ltd",
            "industry_segment": "Manufacturing",
            "risk_type": "CYBER",
            "annual_revenue": 5000000.0,
            "sum_insured": 2000000.0,
            "attachment_point": 500000.0,
            "security_governance_score": 95.0,  # low risk
        },
        headers=carrier_headers,
    )
    client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "High Risk Retail Inc",
            "industry_segment": "Retail",
            "risk_type": "CYBER",
            "annual_revenue": 90000000.0,
            "sum_insured": 20000000.0,
            "attachment_point": 200000.0,
            "prior_claims_count": 3,
            "prior_claims_total": 900000.0,
            "security_governance_score": 20.0,  # high risk
        },
        headers=carrier_headers,
    )

    # Get Queue sorted by risk score desc
    resp = client.get(
        "/api/v1/underwriting/queue?sort_by=risk_score_desc", headers=uw_headers
    )
    assert resp.status_code == 200
    queue = resp.json()
    assert len(queue) >= 2
    # First item should have higher or equal risk score than the next
    assert queue[0]["risk_score"] >= queue[1]["risk_score"]

    # Filter by risk tier HIGH
    resp_high = client.get(
        "/api/v1/underwriting/queue?risk_tier=HIGH", headers=uw_headers
    )
    assert resp_high.status_code == 200
    high_items = resp_high.json()
    assert all(item["risk_tier"] == "HIGH" for item in high_items)


def test_concurrency_lock_acquisition_and_release(
    client, carrier_token, underwriter_token
):
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    uw_headers = {"Authorization": f"Bearer {underwriter_token}"}

    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "Lock Target Enterprise",
            "industry_segment": "Finance",
            "risk_type": "D_AND_O",
            "annual_revenue": 200000000.0,
            "sum_insured": 50000000.0,
            "attachment_point": 5000000.0,
        },
        headers=carrier_headers,
    )
    sub_id = create_resp.json()["id"]

    # Lock submission
    lock_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/lock",
        json={"action": "lock"},
        headers=uw_headers,
    )
    assert lock_resp.status_code == 200
    assert lock_resp.json()["is_locked"] is True

    # Unlock submission
    unlock_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/lock",
        json={"action": "unlock"},
        headers=uw_headers,
    )
    assert unlock_resp.status_code == 200
    assert unlock_resp.json()["is_locked"] is False


def test_underwriting_submission_detail_dossier(
    client, carrier_token, underwriter_token
):
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    uw_headers = {"Authorization": f"Bearer {underwriter_token}"}

    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "Dossier Test Corp",
            "industry_segment": "Healthcare",
            "risk_type": "CYBER",
            "annual_revenue": 45000000.0,
            "sum_insured": 10000000.0,
            "attachment_point": 1000000.0,
            "security_governance_score": 65.0,
        },
        headers=carrier_headers,
    )
    sub_id = create_resp.json()["id"]

    detail_resp = client.get(
        f"/api/v1/underwriting/submissions/{sub_id}",
        headers=uw_headers,
    )
    assert detail_resp.status_code == 200
    dossier = detail_resp.json()
    assert dossier["submission"]["id"] == sub_id
    assert len(dossier["risk_score_breakdown"]) > 0
    assert "audit_logs" in dossier


def test_record_quote_decision_success(client, carrier_token, underwriter_token):
    # AC: Quote & Decline Decision Recording: Underwriters record quote decisions (premium, capacity, deadline)
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    uw_headers = {"Authorization": f"Bearer {underwriter_token}"}

    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "Quoted Risk Industries",
            "industry_segment": "Manufacturing",
            "risk_type": "CYBER",
            "annual_revenue": 30000000.0,
            "sum_insured": 5000000.0,
            "attachment_point": 500000.0,
            "security_governance_score": 85.0,
        },
        headers=carrier_headers,
    )
    sub_id = create_resp.json()["id"]

    decision_payload = {
        "decision": "QUOTE",
        "capacity_offered": 2500000.0,
        "rate_on_line_pct": 3.75,
        "premium_amount": 93750.0,
        "binding_deadline": "2026-07-15",
        "subjectivities": "Subject to receipt of signed statement of values and MFA verification certificate.",
    }
    decision_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=decision_payload,
        headers=uw_headers,
    )
    assert decision_resp.status_code == 201
    decision_data = decision_resp.json()
    assert decision_data["decision"] == "QUOTE"
    assert decision_data["capacity_offered"] == 2500000.0

    # Verify submission status updated to QUOTED
    sub_resp = client.get(f"/api/v1/submissions/{sub_id}", headers=carrier_headers)
    assert sub_resp.json()["status"] == "QUOTED"


def test_record_decline_decision_with_reason(client, carrier_token, underwriter_token):
    # AC: Quote & Decline Decision Recording: Underwriters record decline decisions with reason codes
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    uw_headers = {"Authorization": f"Bearer {underwriter_token}"}

    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "Declined Account Inc",
            "industry_segment": "Finance",
            "risk_type": "D_AND_O",
            "annual_revenue": 500000000.0,
            "sum_insured": 50000000.0,
            "attachment_point": 1000000.0,
        },
        headers=carrier_headers,
    )
    sub_id = create_resp.json()["id"]

    decision_payload = {
        "decision": "DECLINE",
        "decline_reason_code": "HIGH_EXPOSURE_AGGREGATION",
        "decline_notes": "Aggregate catastrophic exposure exceeds current risk limits in sector.",
    }
    decision_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=decision_payload,
        headers=uw_headers,
    )
    assert decision_resp.status_code == 201
    assert decision_resp.json()["decision"] == "DECLINE"
    assert decision_resp.json()["decline_reason_code"] == "HIGH_EXPOSURE_AGGREGATION"

    # Verify submission status updated to DECLINED
    sub_resp = client.get(f"/api/v1/submissions/{sub_id}", headers=carrier_headers)
    assert sub_resp.json()["status"] == "DECLINED"


def test_record_decline_decision_missing_reason_fails(
    client, carrier_token, underwriter_token
):
    carrier_headers = {"Authorization": f"Bearer {carrier_token}"}
    uw_headers = {"Authorization": f"Bearer {underwriter_token}"}

    create_resp = client.post(
        "/api/v1/submissions",
        json={
            "insured_name": "Declined Bad Payload Inc",
            "industry_segment": "Tech",
            "risk_type": "CYBER",
            "annual_revenue": 5000000.0,
            "sum_insured": 1000000.0,
            "attachment_point": 100000.0,
        },
        headers=carrier_headers,
    )
    sub_id = create_resp.json()["id"]

    # Decline without decline_reason_code must fail
    decision_payload = {
        "decision": "DECLINE",
        "decline_reason_code": "",
    }
    decision_resp = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=decision_payload,
        headers=uw_headers,
    )
    assert decision_resp.status_code == 400


def test_decline_reasons_catalogue_endpoints(client):
    # Test all aliases for decline reasons
    endpoints = [
        "/api/v1/decline-reasons",
        "/api/v1/submissions/decline-reasons",
        "/api/v1/underwriting/reasons",
        "/api/v1/underwriting/decline-reasons",
    ]
    for endpoint in endpoints:
        resp = client.get(endpoint)
        assert resp.status_code == 200
        reasons = resp.json()
        assert isinstance(reasons, list)
        codes = [r["code"] for r in reasons]
        assert "HIGH_EXPOSURE_AGGREGATION" in codes
        assert "POOR_CYBER_CONTROLS" in codes

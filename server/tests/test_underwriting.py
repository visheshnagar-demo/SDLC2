def test_underwriting_queue_and_kpis(client, carrier_headers, underwriter_headers):
    # Seed a submission
    payload = {
        "risk_type": "CYBER",
        "insured_name": "FinTech Matrix Solutions",
        "industry_segment": "Financial Services",
        "annual_revenue": 50000000.0,
        "sum_insured": 10000000.0,
        "attachment_point": 500000.0,
        "policy_start_date": "2026-08-01",
        "policy_end_date": "2027-08-01",
        "prior_claims_count": 0,
        "prior_claims_total": 0.0,
        "security_governance_score": 75.0,
    }
    client.post("/api/v1/submissions", json=payload, headers=carrier_headers)

    # Check queue
    res = client.get("/api/v1/underwriting/queue", headers=underwriter_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    item = data["items"][0]
    assert item["insured_name"] == "FinTech Matrix Solutions"
    assert item["risk_type"] == "CYBER"
    assert "risk_score" in item
    assert "risk_tier" in item

    # Check KPIs
    kpi_res = client.get("/api/v1/underwriting/kpi", headers=underwriter_headers)
    assert kpi_res.status_code == 200
    kpis = kpi_res.json()
    assert kpis["total_submissions"] >= 1
    assert kpis["pending_review"] >= 1


def test_underwriting_lock_and_detail(client, carrier_headers, underwriter_headers):
    payload = {
        "risk_type": "D_AND_O",
        "insured_name": "Quantum Energy Corp",
        "industry_segment": "Energy",
        "annual_revenue": 200000000.0,
        "sum_insured": 20000000.0,
        "attachment_point": 1000000.0,
        "policy_start_date": "2026-09-01",
        "policy_end_date": "2027-09-01",
        "prior_claims_count": 1,
        "prior_claims_total": 500000.0,
    }
    sub_res = client.post("/api/v1/submissions", json=payload, headers=carrier_headers)
    sub_id = sub_res.json()["id"]

    # Lock submission
    lock_res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/lock",
        json={"action": "acquire"},
        headers=underwriter_headers,
    )
    assert lock_res.status_code == 200
    assert lock_res.json()["locked"] is True

    # Get underwriter detail view
    detail_res = client.get(
        f"/api/v1/underwriting/submissions/{sub_id}", headers=underwriter_headers
    )
    assert detail_res.status_code == 200
    d_data = detail_res.json()
    assert d_data["submission"]["insured_name"] == "Quantum Energy Corp"
    assert len(d_data["submission"]["score_breakdowns"]) > 0

    # Unlock submission
    unlock_res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/lock",
        json={"action": "release"},
        headers=underwriter_headers,
    )
    assert unlock_res.status_code == 200
    assert unlock_res.json()["locked"] is False


def test_quote_decision_workflow(client, carrier_headers, underwriter_headers):
    payload = {
        "risk_type": "CYBER",
        "insured_name": "CloudScale Logistics",
        "industry_segment": "Logistics",
        "annual_revenue": 80000000.0,
        "sum_insured": 5000000.0,
        "attachment_point": 500000.0,
        "policy_start_date": "2026-10-01",
        "policy_end_date": "2027-10-01",
        "prior_claims_count": 0,
        "prior_claims_total": 0.0,
        "security_governance_score": 88.0,
    }
    sub_res = client.post("/api/v1/submissions", json=payload, headers=carrier_headers)
    sub_id = sub_res.json()["id"]

    quote_payload = {
        "decision": "QUOTE",
        "capacity_offered": 5000000.0,
        "rate_on_line_pct": 3.75,
        "premium_amount": 187500.0,
        "binding_deadline": "2026-09-25",
        "subjectivities": "Subject to receipt of signed cyber application and MFA confirmation.",
    }
    dec_res = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=quote_payload,
        headers=underwriter_headers,
    )
    assert dec_res.status_code == 201
    dec_data = dec_res.json()
    assert dec_data["decision"] == "QUOTE"
    assert dec_data["premium_amount"] == 187500.0

    # Verify submission status transitioned to QUOTED
    sub_detail = client.get(f"/api/v1/submissions/{sub_id}", headers=carrier_headers)
    assert sub_detail.json()["status"] == "QUOTED"


def test_decline_decision_workflow(client, carrier_headers, underwriter_headers):
    payload = {
        "risk_type": "D_AND_O",
        "insured_name": "High Risk Holdings",
        "industry_segment": "Cryptocurrency",
        "annual_revenue": 900000000.0,
        "sum_insured": 50000000.0,
        "attachment_point": 200000.0,
        "policy_start_date": "2026-10-01",
        "policy_end_date": "2027-10-01",
        "prior_claims_count": 5,
        "prior_claims_total": 12000000.0,
    }
    sub_res = client.post("/api/v1/submissions", json=payload, headers=carrier_headers)
    sub_id = sub_res.json()["id"]

    # Decline without reason code should fail (422)
    bad_decline = {
        "decision": "DECLINE",
    }
    res_bad = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=bad_decline,
        headers=underwriter_headers,
    )
    assert res_bad.status_code == 422

    # Valid decline with reason code
    good_decline = {
        "decision": "DECLINE",
        "decline_reason_code": "HIGH_EXPOSURE_AGGREGATION",
        "decline_notes": "Exceeds crypto sector risk appetite and capacity limits.",
    }
    res_good = client.post(
        f"/api/v1/underwriting/submissions/{sub_id}/decisions",
        json=good_decline,
        headers=underwriter_headers,
    )
    assert res_good.status_code == 201
    assert res_good.json()["decision"] == "DECLINE"
    assert res_good.json()["decline_reason_code"] == "HIGH_EXPOSURE_AGGREGATION"

    # Verify status is DECLINED
    sub_detail = client.get(f"/api/v1/submissions/{sub_id}", headers=carrier_headers)
    assert sub_detail.json()["status"] == "DECLINED"

def test_workflow_state_transitions(client, underwriter_headers):
    # Create submission ($4M limit <= $5M authority)
    res = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Standard Flow Corp",
            "line_of_business": "EPLI",
            "policy_limit": 4000000.0,
            "attachment_point": 1000000.0,
            "retention": 200000.0,
            "proposed_premium": 90000.0,
            "effective_date": "2026-11-01",
            "expiry_date": "2027-11-01",
        },
        headers=underwriter_headers,
    )
    sub_id = res.json()["id"]
    assert res.json()["status"] == "RECEIVED"

    # Transition to IN_REVIEW
    t1 = client.patch(
        f"/api/v1/submissions/{sub_id}/status",
        json={"target_status": "IN_REVIEW", "notes": "Underwriter started review"},
        headers=underwriter_headers,
    )
    assert t1.status_code == 200
    assert t1.json()["status"] == "IN_REVIEW"

    # Transition to INFO_REQUESTED
    t2 = client.patch(
        f"/api/v1/submissions/{sub_id}/status",
        json={
            "target_status": "INFO_REQUESTED",
            "notes": "Requested updated HR handbook",
        },
        headers=underwriter_headers,
    )
    assert t2.status_code == 200
    assert t2.json()["status"] == "INFO_REQUESTED"

    # Transition back to IN_REVIEW
    t3 = client.patch(
        f"/api/v1/submissions/{sub_id}/status",
        json={"target_status": "IN_REVIEW", "notes": "Received handbook"},
        headers=underwriter_headers,
    )
    assert t3.status_code == 200
    assert t3.json()["status"] == "IN_REVIEW"


def test_referral_to_manager_and_approval(client, underwriter_headers, manager_headers):
    # Create high-limit submission ($15M limit > $5M underwriter limit)
    res = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Mega Health Systems",
            "line_of_business": "MEDMAL",
            "policy_limit": 15000000.0,
            "attachment_point": 3000000.0,
            "retention": 1000000.0,
            "proposed_premium": 600000.0,
            "effective_date": "2026-12-01",
            "expiry_date": "2027-12-01",
        },
        headers=underwriter_headers,
    )
    sub_id = res.json()["id"]

    # Underwriter moves to IN_REVIEW
    client.patch(
        f"/api/v1/submissions/{sub_id}/status",
        json={"target_status": "IN_REVIEW"},
        headers=underwriter_headers,
    )

    # Underwriter attempts to QUOTE directly -> triggers referral to manager
    t_quote = client.patch(
        f"/api/v1/submissions/{sub_id}/status",
        json={"target_status": "QUOTED"},
        headers=underwriter_headers,
    )
    assert t_quote.status_code == 200
    assert t_quote.json()["status"] == "REFERRED_TO_MANAGER"
    assert t_quote.json()["referral_status"] == "PENDING"

    # Manager approves referral
    ref_dec = client.post(
        f"/api/v1/submissions/{sub_id}/referral/decision",
        json={
            "decision": "APPROVED",
            "notes": "Approved exceptional capacity for hospital network",
        },
        headers=manager_headers,
    )
    assert ref_dec.status_code == 200
    assert ref_dec.json()["referral_status"] == "APPROVED"
    assert ref_dec.json()["status"] == "IN_REVIEW"

    # Now Underwriter or Manager can quote and bind
    final_bind = client.post(
        f"/api/v1/submissions/{sub_id}/decisions",
        json={"decision": "BOUND", "notes": "Bound with manager referral exception"},
        headers=underwriter_headers,
    )
    assert final_bind.status_code == 200
    assert final_bind.json()["status"] == "BOUND"


def test_mandatory_decline_reason(client, underwriter_headers):
    # Create submission
    res = client.post(
        "/api/v1/submissions",
        json={
            "ceding_org_id": "HGIC-770",
            "insured_name": "Declined Risk Inc",
            "line_of_business": "CYBER",
            "policy_limit": 3000000.0,
            "attachment_point": 500000.0,
            "retention": 100000.0,
            "proposed_premium": 60000.0,
            "effective_date": "2026-11-01",
            "expiry_date": "2027-11-01",
        },
        headers=underwriter_headers,
    )
    sub_id = res.json()["id"]

    # Decline without reason code -> 400 Bad Request
    fail_dec = client.post(
        f"/api/v1/submissions/{sub_id}/decisions",
        json={"decision": "DECLINED", "notes": "Declined"},
        headers=underwriter_headers,
    )
    assert fail_dec.status_code == 400

    # Decline with mandatory reason code -> Success
    success_dec = client.post(
        f"/api/v1/submissions/{sub_id}/decisions",
        json={
            "decision": "DECLINED",
            "decline_reason_code": "CONTROL_DEFICIENCY",
            "notes": "Lacks EDR and air-gapped backups",
        },
        headers=underwriter_headers,
    )
    assert success_dec.status_code == 200
    assert success_dec.json()["status"] == "DECLINED"
    assert success_dec.json()["decline_reason_code"] == "CONTROL_DEFICIENCY"

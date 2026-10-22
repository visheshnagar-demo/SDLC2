from fastapi.testclient import TestClient


def test_quote_builder_calculations(client: TestClient):
    # 1. Create a submission
    payload = {
        "cedingCompanyName": "Liberty Mutual",
        "insuredName": "Omni Health Solutions",
        "lineOfBusiness": "E&O",
        "policyLimit": 4000000.0,
        "attachmentPoint": 1000000.0,
        "retention": 100000.0,
        "grossPremium": 100000.0,
        "effectiveDate": "2026-09-01",
        "expiryDate": "2027-09-01",
        "industry": "Consulting",
        "revenueBand": "$10M - $25M",
        "jurisdiction": "US-TX",
    }

    sub_res = client.post("/api/v1/submissions", json=payload)
    assert sub_res.status_code == 201
    sub_id = sub_res.json()["id"]

    # 2. Create Quote: 50% share, 20% commission on $100,000 gross premium
    quote_req = {
        "shareOfferedPercentage": 50.0,
        "cedingCommissionPercentage": 20.0,
        "subjectivities": "Subject to clean loss runs update prior to binding",
        "conditions": "Standard facultative reinsurance agreement",
        "exclusions": "Prior acts before 2020 excluded",
    }

    quote_res = client.post(f"/api/v1/submissions/{sub_id}/quotes", json=quote_req)
    assert quote_res.status_code == 201
    qdata = quote_res.json()
    assert qdata["calculatedReinsurancePremium"] == 50000.0
    assert qdata["cedingCommissionAmount"] == 10000.0
    assert qdata["netReinsurancePremium"] == 40000.0
    assert qdata["status"] == "ISSUED"

    # Verify status changed to QUOTED
    sub_detail = client.get(f"/api/v1/submissions/{sub_id}").json()
    assert sub_detail["status"] == "QUOTED"


def test_decision_workflow_and_mandatory_decline_reason(client: TestClient):
    # 1. Create submission
    payload = {
        "cedingCompanyName": "Hartford",
        "insuredName": "Delta Consulting",
        "lineOfBusiness": "EPLI",
        "policyLimit": 2000000.0,
        "attachmentPoint": 500000.0,
        "retention": 50000.0,
        "grossPremium": 45000.0,
        "effectiveDate": "2026-10-01",
        "expiryDate": "2027-10-01",
        "industry": "Professional Services",
        "revenueBand": "$5M - $10M",
        "jurisdiction": "US-MA",
    }

    sub_res = client.post("/api/v1/submissions", json=payload)
    sub_id = sub_res.json()["id"]

    # 2. Attempt DECLINED without reason -> Must fail
    bad_dec = {"targetStatus": "DECLINED"}
    res_bad = client.patch(f"/api/v1/submissions/{sub_id}/status", json=bad_dec)
    assert res_bad.status_code == 400

    # 3. DECLINED with mandatory reason -> Must succeed
    good_dec = {
        "targetStatus": "DECLINED",
        "declineReason": "Adverse claims frequency and inadequate retention structure",
        "underwriterNotes": "Reviewed with senior underwriting team",
    }
    res_good = client.patch(f"/api/v1/submissions/{sub_id}/status", json=good_dec)
    assert res_good.status_code == 200
    assert res_good.json()["status"] == "DECLINED"


def test_manager_referral_authority_limit(client: TestClient):
    # Create submission with $10M limit (> default underwriter limit of $5M)
    payload = {
        "cedingCompanyName": "Berkshire",
        "insuredName": "MegaCorp Logistics",
        "lineOfBusiness": "Cyber Risk",
        "policyLimit": 10000000.0,
        "attachmentPoint": 2000000.0,
        "retention": 200000.0,
        "grossPremium": 200000.0,
        "effectiveDate": "2026-11-01",
        "expiryDate": "2027-11-01",
        "industry": "Transportation",
        "revenueBand": "$250M+",
        "jurisdiction": "US-DE",
    }

    sub_res = client.post("/api/v1/submissions", json=payload)
    sub_id = sub_res.json()["id"]

    # Underwriter attempts to transition to QUOTED -> Automatic referral trigger
    underwriter_headers = {
        "X-User-Role": "ROLE_UNDERWRITER",
        "X-User-Email": "underwriter@example.com",
    }
    dec_req = {"targetStatus": "QUOTED"}
    res_uw = client.patch(
        f"/api/v1/submissions/{sub_id}/status",
        json=dec_req,
        headers=underwriter_headers,
    )
    assert res_uw.status_code == 200
    assert res_uw.json()["status"] == "REFERRED_TO_MANAGER"
    assert res_uw.json()["isReferred"] is True

    # Manager approves referral
    manager_headers = {
        "X-User-Role": "ROLE_MANAGER",
        "X-User-Email": "admin@example.com",
    }
    ref_req = {
        "decision": "APPROVE",
        "managerNotes": "Approved given high attachment point",
    }
    res_mgr = client.post(
        f"/api/v1/submissions/{sub_id}/referral/decision",
        json=ref_req,
        headers=manager_headers,
    )
    assert res_mgr.status_code == 200
    assert res_mgr.json()["status"] == "QUOTED"
    assert res_mgr.json()["isReferred"] is False

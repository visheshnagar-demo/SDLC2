from fastapi.testclient import TestClient


def test_underwriting_queue_listing_and_filtering(client: TestClient):
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]

    # Create cyber submission
    client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "CYBER",
            "insured_name": "Cyber Target One",
            "limit_requested": 10000000.0,
            "attachment_point": 5000000.0,
            "retention": 1000000.0,
            "effective_date": "2026-01-01",
            "expiry_date": "2027-01-01",
            "prior_loss_count": 0,
            "risk_attributes": {"mfa_enabled": True, "edr_deployed": True},
        },
    )

    # Create D&O submission
    client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "D_AND_O",
            "insured_name": "Executive Management Group",
            "limit_requested": 20000000.0,
            "attachment_point": 10000000.0,
            "retention": 2000000.0,
            "effective_date": "2026-01-01",
            "expiry_date": "2027-01-01",
            "prior_loss_count": 3,
            "prior_loss_total": 4000000.0,
            "risk_attributes": {
                "pending_litigation": True,
                "debt_to_equity_ratio": 2.5,
            },
        },
    )

    # Test Queue fetch
    queue_resp = client.get("/api/v1/underwriting/queue")
    assert queue_resp.status_code == 200
    queue = queue_resp.json()
    assert len(queue) >= 2

    # Filter by risk_type
    cyber_queue = client.get("/api/v1/underwriting/queue?risk_type=CYBER").json()
    assert all(item["risk_type"] == "CYBER" for item in cyber_queue)

    dand_o_queue = client.get("/api/v1/underwriting/queue?risk_type=D_AND_O").json()
    assert all(item["risk_type"] == "D_AND_O" for item in dand_o_queue)

    # Sort tests
    sorted_asc = client.get("/api/v1/underwriting/queue?sort_by=score_asc").json()
    scores = [item["risk_score"] for item in sorted_asc]
    assert scores == sorted(scores)


def test_score_breakdown_and_checklist(client: TestClient):
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]
    sub_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "CYBER",
            "insured_name": "DataVault Systems",
            "limit_requested": 8000000.0,
            "attachment_point": 4000000.0,
            "retention": 1000000.0,
            "effective_date": "2026-02-01",
            "expiry_date": "2027-02-01",
            "prior_loss_count": 1,
            "prior_loss_total": 100000.0,
            "risk_attributes": {"mfa_enabled": False, "edr_deployed": True},
        },
    )
    sub_id = sub_resp.json()["id"]

    # Score breakdown
    score_resp = client.get(f"/api/v1/underwriting/{sub_id}/score-breakdown")
    assert score_resp.status_code == 200
    score_data = score_resp.json()
    assert score_data["submission_id"] == sub_id
    assert len(score_data["factors"]) > 0
    assert "recommendation" in score_data

    # Checklist
    checklist_resp = client.get(f"/api/v1/underwriting/{sub_id}/checklist")
    assert checklist_resp.status_code == 200
    checklist_data = checklist_resp.json()
    assert checklist_data["submission_id"] == sub_id
    assert checklist_data["total_checks"] > 0
    assert len(checklist_data["missing_flags"]) > 0


def test_request_info_and_resolve_flag(client: TestClient):
    carrier_id = client.get("/api/v1/carriers").json()[0]["id"]
    sub_resp = client.post(
        "/api/v1/submissions",
        json={
            "carrier_id": carrier_id,
            "risk_type": "D_AND_O",
            "insured_name": "Pinnacle Energy Corp",
            "limit_requested": 12000000.0,
            "attachment_point": 5000000.0,
            "retention": 1000000.0,
            "effective_date": "2026-03-01",
            "expiry_date": "2027-03-01",
        },
    )
    sub_id = sub_resp.json()["id"]

    # Request info
    req_resp = client.post(
        f"/api/v1/underwriting/{sub_id}/request-info?notes=Please+provide+audited+financials"
    )
    assert req_resp.status_code == 200

    # Check submission status
    sub_details = client.get(f"/api/v1/submissions/{sub_id}").json()
    assert sub_details["status"] == "INFORMATION_REQUESTED"
    assert "Please provide audited financials" in sub_details["notes"]

    # Resolve flag
    flag_id = sub_details["missing_flags"][0]["id"]
    resolve_resp = client.post(f"/api/v1/underwriting/{sub_id}/resolve-flag/{flag_id}")
    assert resolve_resp.status_code == 200

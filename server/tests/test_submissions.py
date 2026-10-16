def test_create_cyber_submission_with_docs(client):
    payload = {
        "carrier_name": "Liberty Specialty Markets",
        "carrier_rating": "A+",
        "risk_category": "CYBER",
        "policy_limit_usd": 10000000.0,
        "attachment_point_usd": 5000000.0,
        "effective_date": "2026-06-01",
        "expiration_date": "2027-06-01",
        "primary_policy_number": "POL-CYB-2026-9901",
        "insured_entity_name": "Acme Global Tech Corp.",
        "industry_sector": "Technology & Cloud Services",
        "prior_loss_amount_usd": 150000.0,
        "attached_documents": [
            {
                "document_type": "CYBER_QUESTIONNAIRE",
                "file_name": "acme_cyber_assessment.pdf",
                "file_size_bytes": 1048576,
                "storage_uri": "gs://reinsurance-docs/2026/acme_cyber_assessment.pdf",
            },
            {
                "document_type": "PRIMARY_POLICY_SCHEDULE",
                "file_name": "acme_primary_schedule.pdf",
                "file_size_bytes": 524288,
                "storage_uri": "gs://reinsurance-docs/2026/acme_primary_schedule.pdf",
            },
            {
                "document_type": "INCIDENT_HISTORY",
                "file_name": "acme_loss_run_3yr.pdf",
                "file_size_bytes": 786432,
                "storage_uri": "gs://reinsurance-docs/2026/acme_loss_run_3yr.pdf",
            },
        ],
    }

    response = client.post("/api/v1/reinsurance-requests", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["risk_category"] == "CYBER"
    assert data["status"] == "SUBMITTED"
    assert data["has_missing_info"] is False
    assert data["missing_flags_count"] == 0
    assert data["risk_score"] > 0
    assert "FAC-2026-CYB-" in data["submission_reference"]


def test_create_cyber_submission_missing_docs_flags(client):
    payload = {
        "carrier_name": "Acme Mutual Insurance Co.",
        "carrier_rating": "A+",
        "risk_category": "CYBER",
        "policy_limit_usd": 10000000.0,
        "attachment_point_usd": 5000000.0,
        "effective_date": "2026-06-01",
        "expiration_date": "2027-06-01",
        "primary_policy_number": "POL-CYB-2026-8819",
        "insured_entity_name": "Apex Global Logistics Inc.",
        "industry_sector": "Logistics & Supply Chain",
        "prior_loss_amount_usd": 250000.0,
        "attached_documents": [],
    }

    response = client.post("/api/v1/reinsurance-requests", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["has_missing_info"] is True
    assert data["missing_flags_count"] >= 1

    sub_id = data["id"]
    get_res = client.get(f"/api/v1/reinsurance-requests/{sub_id}")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert len(detail["missing_flags"]) >= 1
    flag_fields = [f["field_name"] for f in detail["missing_flags"]]
    assert "CYBER_QUESTIONNAIRE" in flag_fields


def test_create_submission_invalid_dates_rejected(client):
    payload = {
        "carrier_name": "Acme Mutual",
        "carrier_rating": "A",
        "risk_category": "DO",
        "policy_limit_usd": 10000000.0,
        "attachment_point_usd": 5000000.0,
        "effective_date": "2027-06-01",
        "expiration_date": "2026-06-01",  # Invalid: expiration before effective
        "primary_policy_number": "POL-DO-001",
        "insured_entity_name": "Test Co",
        "industry_sector": "Finance",
        "prior_loss_amount_usd": 0.0,
    }

    response = client.post("/api/v1/reinsurance-requests", json=payload)
    assert response.status_code == 422


def test_create_submission_negative_limit_rejected(client):
    payload = {
        "carrier_name": "Acme Mutual",
        "carrier_rating": "A",
        "risk_category": "CYBER",
        "policy_limit_usd": -500.0,
        "attachment_point_usd": 5000000.0,
        "effective_date": "2026-06-01",
        "expiration_date": "2027-06-01",
        "primary_policy_number": "POL-CYB-001",
        "insured_entity_name": "Test Co",
        "industry_sector": "Tech",
    }

    response = client.post("/api/v1/reinsurance-requests", json=payload)
    assert response.status_code == 422


def test_get_nonexistent_submission(client):
    response = client.get("/api/v1/reinsurance-requests/nonexistent-id-12345")
    assert response.status_code == 404

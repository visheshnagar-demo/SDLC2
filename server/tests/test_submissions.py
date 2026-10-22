import io

from fastapi.testclient import TestClient


def test_create_submission_success(client: TestClient):
    payload = {
        "cedingCompanyName": "Travelers Insurance",
        "insuredName": "Apex Cybernetics Corp",
        "lineOfBusiness": "Cyber Risk",
        "policyLimit": 10000000.0,
        "attachmentPoint": 5000000.0,
        "retention": 500000.0,
        "grossPremium": 150000.0,
        "effectiveDate": "2026-06-01",
        "expiryDate": "2027-06-01",
        "industry": "Technology",
        "revenueBand": "$50M - $100M",
        "jurisdiction": "US-NY",
        "riskAttributes": {
            "hasMfa": True,
            "hasEdr": True,
            "hasBackups": True,
            "priorLossCount": 0,
            "hasTraining": True,
        },
    }

    response = client.post("/api/v1/submissions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["insuredName"] == "Apex Cybernetics Corp"
    assert data["status"] == "RECEIVED"
    assert data["riskScore"] == 100
    assert data["riskTier"] == "LOW"
    assert len(data["factorBreakdown"]) == 5


def test_create_submission_validation_errors(client: TestClient):
    # Effective date after expiry date
    payload_bad_dates = {
        "cedingCompanyName": "Travelers Insurance",
        "insuredName": "Apex Cybernetics Corp",
        "lineOfBusiness": "Cyber Risk",
        "policyLimit": 10000000.0,
        "attachmentPoint": 5000000.0,
        "retention": 500000.0,
        "grossPremium": 150000.0,
        "effectiveDate": "2027-06-01",
        "expiryDate": "2026-06-01",
        "industry": "Technology",
        "revenueBand": "$50M - $100M",
        "jurisdiction": "US-NY",
    }

    response = client.post("/api/v1/submissions", json=payload_bad_dates)
    assert response.status_code == 422 or response.status_code == 400

    # Limit <= Attachment point
    payload_bad_limit = {
        "cedingCompanyName": "Travelers Insurance",
        "insuredName": "Apex Cybernetics Corp",
        "lineOfBusiness": "Cyber Risk",
        "policyLimit": 5000000.0,
        "attachmentPoint": 10000000.0,
        "retention": 500000.0,
        "grossPremium": 150000.0,
        "effectiveDate": "2026-06-01",
        "expiryDate": "2027-06-01",
        "industry": "Technology",
        "revenueBand": "$50M - $100M",
        "jurisdiction": "US-NY",
    }

    response = client.post("/api/v1/submissions", json=payload_bad_limit)
    assert response.status_code == 422 or response.status_code == 400


def test_get_submissions_and_detail(client: TestClient):
    payload = {
        "cedingCompanyName": "Chubb",
        "insuredName": "BioMed Health Systems",
        "lineOfBusiness": "Medical Professional Liability",
        "policyLimit": 8000000.0,
        "attachmentPoint": 2000000.0,
        "retention": 250000.0,
        "grossPremium": 220000.0,
        "effectiveDate": "2026-07-01",
        "expiryDate": "2027-07-01",
        "industry": "Healthcare",
        "revenueBand": "$100M - $250M",
        "jurisdiction": "US-CA",
        "riskAttributes": {
            "priorLossCount": 1,
            "experienceYears": 12,
            "standardRiskControls": True,
        },
    }

    create_res = client.post("/api/v1/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Get Queue
    list_res = client.get(
        "/api/v1/submissions?lineOfBusiness=Medical Professional Liability"
    )
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 1
    assert any(i["id"] == sub_id for i in items)

    # Get Single Detail
    detail_res = client.get(f"/api/v1/submissions/{sub_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["insuredName"] == "BioMed Health Systems"


def test_upload_document(client: TestClient):
    payload = {
        "cedingCompanyName": "AIG",
        "insuredName": "FinTech Innovations LLC",
        "lineOfBusiness": "D&O",
        "policyLimit": 6000000.0,
        "attachmentPoint": 1000000.0,
        "retention": 100000.0,
        "grossPremium": 95000.0,
        "effectiveDate": "2026-08-01",
        "expiryDate": "2027-08-01",
        "industry": "Financial Services",
        "revenueBand": "$25M - $50M",
        "jurisdiction": "US-IL",
        "riskAttributes": {
            "financialStrength": "Strong",
            "priorClaimsCount": 0,
            "independentBoard": True,
            "regulatoryInquiries": False,
        },
    }

    create_res = client.post("/api/v1/submissions", json=payload)
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # Upload document
    file_content = b"Mock PDF Application Content for Reinsurance Intake"
    files = {
        "file": ("application_d_and_o.pdf", io.BytesIO(file_content), "application/pdf")
    }
    data = {"documentType": "APPLICATION"}

    doc_res = client.post(
        f"/api/v1/submissions/{sub_id}/documents", files=files, data=data
    )
    assert doc_res.status_code == 201
    doc_data = doc_res.json()
    assert doc_data["documentType"] == "APPLICATION"
    assert doc_data["fileName"] == "application_d_and_o.pdf"
    assert doc_data["submissionId"] == sub_id

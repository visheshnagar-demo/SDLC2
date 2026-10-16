def test_underwriter_queue_query_and_sorting(client):
    # Query default queue
    res = client.get("/api/v1/reinsurance/underwriting/queue?skip=0&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "items" in data
    assert len(data["items"]) >= 1

    item = data["items"][0]
    assert "submission_id" in item
    assert "carrier_name" in item
    assert "insured_name" in item
    assert "composite_score" in item
    assert "risk_tier" in item
    assert "missing_flags_count" in item


def test_underwriter_queue_filtering(client):
    # Filter by risk_type = CYBER
    res_cyber = client.get("/api/v1/reinsurance/underwriting/queue?risk_type=CYBER")
    assert res_cyber.status_code == 200
    for item in res_cyber.json()["items"]:
        assert item["risk_type"] == "CYBER"

    # Filter by risk_type = D_AND_O
    res_dno = client.get("/api/v1/reinsurance/underwriting/queue?risk_type=D_AND_O")
    assert res_dno.status_code == 200
    for item in res_dno.json()["items"]:
        assert item["risk_type"] == "D_AND_O"


def test_underwriter_metrics(client):
    res = client.get("/api/v1/reinsurance/underwriting/metrics")
    assert res.status_code == 200
    metrics = res.json()
    assert "total_submissions" in metrics
    assert "status_breakdown" in metrics
    assert "risk_type_breakdown" in metrics

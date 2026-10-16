def test_get_underwriter_queue_default(client):
    response = client.get("/api/v1/underwriting/queue")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_get_queue_filter_by_risk_category(client):
    res_cyber = client.get("/api/v1/underwriting/queue?risk_category=CYBER")
    assert res_cyber.status_code == 200
    cyber_data = res_cyber.json()
    for item in cyber_data["items"]:
        assert item["risk_category"] == "CYBER"

    res_do = client.get("/api/v1/underwriting/queue?risk_category=DO")
    assert res_do.status_code == 200
    do_data = res_do.json()
    for item in do_data["items"]:
        assert item["risk_category"] == "DO"


def test_get_queue_filter_by_status(client):
    res_quoted = client.get("/api/v1/underwriting/queue?status=QUOTED")
    assert res_quoted.status_code == 200
    quoted_data = res_quoted.json()
    for item in quoted_data["items"]:
        assert item["status"] == "QUOTED"


def test_get_queue_sorting_by_risk_score(client):
    response = client.get(
        "/api/v1/underwriting/queue?sort_by=risk_score&sort_order=desc"
    )
    assert response.status_code == 200
    data = response.json()
    scores = [item["risk_score"] for item in data["items"]]
    assert scores == sorted(scores, reverse=True)


def test_get_queue_pagination(client):
    response = client.get("/api/v1/underwriting/queue?skip=0&limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 1
    assert data["limit"] == 1
    assert data["skip"] == 0

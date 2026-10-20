def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "genre-qtb-backend"
    assert "timestamp" in data
    assert "datasets" in data
    assert data["datasets"]["quotes"] >= 4
    assert data["datasets"]["risks"] >= 4
    assert data["datasets"]["binders"] >= 1

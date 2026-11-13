def test_health_endpoints(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "genre-qtb-backend"

    response_v1 = client.get("/api/v1/health")
    assert response_v1.status_code == 200


def test_list_scenarios(client):
    response = client.get("/api/v1/qtb/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 3
    scenario_ids = [s["scenario_id"] for s in scenarios]
    assert "SCENARIO_A" in scenario_ids
    assert "SCENARIO_B" in scenario_ids
    assert "SCENARIO_C" in scenario_ids


def test_load_scenario_a(client):
    response = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    assert response.status_code == 200
    case = response.json()
    assert case["scenario_id"] == "SCENARIO_A"
    assert case["case_number"] == "QTB-2026-8891"
    assert case["cedent_name"] == "Apex Mutual Insurance Co."
    assert case["requested_limit"] == 5000000.0
    assert len(case["extracted_fields"]) >= 5
    assert len(case["stages"]) == 12


def test_load_invalid_scenario(client):
    response = client.post("/api/v1/qtb/scenarios/INVALID_SCENARIO/load")
    assert response.status_code == 404

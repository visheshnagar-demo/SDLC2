def test_list_and_get_case(client):
    # Ensure scenario is loaded
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    assert load_res.status_code == 200
    loaded_case = load_res.json()
    case_id = loaded_case["id"]

    # List cases
    list_res = client.get("/api/v1/qtb/cases")
    assert list_res.status_code == 200
    cases = list_res.json()
    assert len(cases) >= 1

    # Get case by ID
    get_res = client.get(f"/api/v1/qtb/cases/{case_id}")
    assert get_res.status_code == 200
    case_data = get_res.json()
    assert case_data["id"] == case_id
    assert case_data["case_number"] == "QTB-2026-8891"

    # Get case by case_number
    get_by_num = client.get("/api/v1/qtb/cases/QTB-2026-8891")
    assert get_by_num.status_code == 200

    # Get case by scenario_id
    get_by_scen = client.get("/api/v1/qtb/cases/SCENARIO_A")
    assert get_by_scen.status_code == 200


def test_get_nonexistent_case(client):
    res = client.get("/api/v1/qtb/cases/non-existent-id")
    assert res.status_code == 404


def test_get_case_stages(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    stages_res = client.get(f"/api/v1/qtb/cases/{case_id}/stages")
    assert stages_res.status_code == 200
    stages = stages_res.json()
    assert len(stages) == 12
    assert stages[0]["stage_key"] == "SUBMISSION_INTAKE"
    assert stages[0]["status"] == "COMPLETED"


def test_get_audit_logs(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    logs_res = client.get(f"/api/v1/qtb/cases/{case_id}/audit-logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 1
    assert logs[0]["stage_key"] == "SUBMISSION_INTAKE"

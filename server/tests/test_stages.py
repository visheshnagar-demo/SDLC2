def test_execute_extraction_stage(client):
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_A/load")
    case_id = load_res.json()["id"]

    res = client.post(
        f"/api/v1/qtb/cases/{case_id}/stages/DOCUMENT_EXTRACTION/execute",
        json={"actor_persona": "Reinsurance Underwriter", "parameters": {}},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["stage_key"] == "DOCUMENT_EXTRACTION"
    assert data["status"] == "COMPLETED"
    assert "Extracted" in data["agent_reasoning"]
    assert data["confidence_score"] >= 0.90


def test_scenario_b_validation_exception_and_override(client):
    # Load Scenario B (Incomplete submission)
    load_res = client.post("/api/v1/qtb/scenarios/SCENARIO_B/load")
    assert load_res.status_code == 200
    case_id = load_res.json()["id"]

    # Execute Stage 3 (Completeness Validation)
    val_res = client.post(
        f"/api/v1/qtb/cases/{case_id}/stages/COMPLETENESS_VALIDATION/execute",
        json={"actor_persona": "Reinsurance Underwriter", "parameters": {}},
    )
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["status"] == "EXCEPTION"
    assert "BR-01" in val_data["agent_reasoning"]

    # Apply Human Exception Override
    override_res = client.post(
        f"/api/v1/qtb/cases/{case_id}/overrides",
        json={
            "stage_key": "COMPLETENESS_VALIDATION",
            "field_name": "3-Year Detailed Claims & Loss Runs",
            "override_value": "Provisional waiver granted based on pristine 10-year audited financial records",
            "rationale": "Cedent has S&P A+ rating; loss runs requested from broker prior to bind",
            "actor_persona": "Reinsurance Underwriter",
        },
    )
    assert override_res.status_code == 200
    override_data = override_res.json()
    assert override_data["action_type"] == "EXCEPTION_OVERRIDE"

    # Verify stage is unblocked
    case_res = client.get(f"/api/v1/qtb/cases/{case_id}")
    assert case_res.status_code == 200
    case_data = case_res.json()
    comp_stage = next(
        s for s in case_data["stages"] if s["stage_key"] == "COMPLETENESS_VALIDATION"
    )
    assert comp_stage["status"] == "COMPLETED"

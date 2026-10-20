def test_get_and_update_scoring_rules(client, manager_headers, underwriter_headers):
    # Get all rules
    rules_res = client.get("/api/v1/config/scoring-rules", headers=underwriter_headers)
    assert rules_res.status_code == 200
    rules = rules_res.json()
    assert len(rules) >= 5

    # Get Cyber rule
    cyber_res = client.get(
        "/api/v1/config/scoring-rules/CYBER", headers=underwriter_headers
    )
    assert cyber_res.status_code == 200
    assert cyber_res.json()["line_of_business"] == "CYBER"

    # Manager updates Cyber authority limit & warning SLA
    update_res = client.put(
        "/api/v1/config/scoring-rules/CYBER",
        json={
            "authority_limit_threshold": 7500000.0,
            "warning_sla_hours": 18.0,
        },
        headers=manager_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["authority_limit_threshold"] == 7500000.0
    assert update_res.json()["warning_sla_hours"] == 18.0

    # Non-manager update -> 403 Forbidden
    non_mgr_res = client.put(
        "/api/v1/config/scoring-rules/CYBER",
        json={"authority_limit_threshold": 10000000.0},
        headers=underwriter_headers,
    )
    assert non_mgr_res.status_code == 403

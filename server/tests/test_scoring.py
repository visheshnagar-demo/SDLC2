def test_calculate_risk_score_do_elevated(client):
    payload = {
        "risk_category": "DO",
        "policy_limit_usd": 20000000.0,
        "attachment_point_usd": 10000000.0,
        "carrier_rating": "A",
        "industry_sector": "Biotechnology",
        "prior_loss_amount_usd": 500000.0,
    }

    response = client.post("/api/v1/underwriting/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_grade"] in ["LOW", "MODERATE", "ELEVATED", "SEVERE"]
    assert data["priority"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    breakdown = data["breakdown"]
    assert "exposure_score" in breakdown
    assert "carrier_rating_penalty" in breakdown
    assert "category_baseline" in breakdown
    assert "loss_history_factor" in breakdown
    assert breakdown["exposure_score"] > 0


def test_calculate_risk_score_cyber_low_risk(client):
    payload = {
        "risk_category": "CYBER",
        "policy_limit_usd": 2000000.0,
        "attachment_point_usd": 5000000.0,
        "carrier_rating": "A++",
        "industry_sector": "Agriculture",
        "prior_loss_amount_usd": 0.0,
    }

    response = client.post("/api/v1/underwriting/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] < 60.0

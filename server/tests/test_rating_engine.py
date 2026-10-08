from server.rating_engine import calculate_motor_premium


def test_standard_example_quote():
    # Example from PO and Design specs:
    # 2022 Toyota ($25,000), age 30, 5 yrs exp, Comprehensive -> $1,200
    result = calculate_motor_premium(
        vehicle_make="Toyota",
        vehicle_year=2022,
        vehicle_value=25000.0,
        driver_age=30,
        driving_experience=5,
        coverage_type="Comprehensive"
    )

    assert result["base_premium"] == 500.0
    assert result["total_premium"] == 1200.0
    
    breakdown_map = {item["factor_name"]: item["amount"] for item in result["breakdown"]}
    assert breakdown_map["Base Tariff Premium"] == 500.0
    assert breakdown_map["Vehicle Value Loading (1.2%)"] == 300.0
    assert breakdown_map["Driver Age Adjustment (26-35)"] == 100.0
    assert breakdown_map["Driving Experience Discount (5 yrs)"] == -100.0
    assert breakdown_map["Comprehensive Coverage Surcharge"] == 400.0


def test_age_brackets():
    # Novice driver 18 years old
    novice = calculate_motor_premium("Honda", 2020, 10000.0, 18, 1, "Third Party")
    novice_map = {item["factor_name"]: item["amount"] for item in novice["breakdown"]}
    assert "Driver Age Adjustment (16-20)" in novice_map
    assert novice_map["Driver Age Adjustment (16-20)"] == 300.0

    # Young driver 23 years old
    young = calculate_motor_premium("Honda", 2020, 10000.0, 23, 3, "Third Party")
    young_map = {item["factor_name"]: item["amount"] for item in young["breakdown"]}
    assert "Driver Age Adjustment (21-25)" in young_map
    assert young_map["Driver Age Adjustment (21-25)"] == 200.0

    # Prime adult 45 years old
    prime = calculate_motor_premium("Honda", 2020, 10000.0, 45, 20, "Third Party")
    prime_map = {item["factor_name"]: item["amount"] for item in prime["breakdown"]}
    assert "Driver Age Adjustment (36-60)" in prime_map
    assert prime_map["Driver Age Adjustment (36-60)"] == 0.0

    # Senior driver 68 years old
    senior = calculate_motor_premium("Honda", 2020, 10000.0, 68, 30, "Third Party")
    senior_map = {item["factor_name"]: item["amount"] for item in senior["breakdown"]}
    assert "Driver Age Adjustment (60+)" in senior_map
    assert senior_map["Driver Age Adjustment (60+)"] == 150.0


def test_coverage_tiers():
    # Third party: 0 surcharge
    tp = calculate_motor_premium("Ford", 2018, 15000.0, 40, 10, "Third Party")
    assert any(item["factor_name"] == "Third Party Basic Coverage" and item["amount"] == 0.0 for item in tp["breakdown"])

    # Fire and theft: +200 surcharge
    tpft = calculate_motor_premium("Ford", 2018, 15000.0, 40, 10, "Third Party Fire and Theft")
    assert any(item["factor_name"] == "Third Party Fire & Theft Coverage Surcharge" and item["amount"] == 200.0 for item in tpft["breakdown"])

    # Comprehensive: +400 surcharge
    comp = calculate_motor_premium("Ford", 2018, 15000.0, 40, 10, "Comprehensive")
    assert any(item["factor_name"] == "Comprehensive Coverage Surcharge" and item["amount"] == 400.0 for item in comp["breakdown"])


def test_minimum_premium_floor():
    # Low value car, high experience, prime age, basic coverage
    result = calculate_motor_premium("Old Beater", 2000, 500.0, 50, 30, "Third Party")
    # Base: 500, Value Loading: 6.00, Age: 0, Exp: -300, Cov: 0 -> raw total = 206.00
    assert result["total_premium"] >= 100.0

from typing import Dict, List, Any


def calculate_motor_premium(
    vehicle_make: str,
    vehicle_year: int,
    vehicle_value: float,
    driver_age: int,
    driving_experience: int,
    coverage_type: str
) -> Dict[str, Any]:
    """
    Deterministic rating engine calculating motor insurance premiums
    and itemized factor breakdowns based on underwriting rating tables.
    """
    breakdown: List[Dict[str, Any]] = []

    # 1. Base Tariff Premium
    base_premium = 500.00
    breakdown.append({
        "factor_name": "Base Tariff Premium",
        "amount": base_premium,
        "category": "base",
        "description": "Standard base underwriting tariff rate"
    })

    # 2. Vehicle Value Loading (1.2% of vehicle value)
    vehicle_loading = round(vehicle_value * 0.012, 2)
    breakdown.append({
        "factor_name": "Vehicle Value Loading (1.2%)",
        "amount": vehicle_loading,
        "category": "vehicle",
        "description": f"1.2% risk loading on vehicle market value (${vehicle_value:,.2f})"
    })

    # 3. Driver Age Risk Adjustment
    if 16 <= driver_age <= 20:
        age_adj = 300.00
        age_label = "Driver Age Adjustment (16-20)"
        age_desc = "Young novice driver risk loading"
    elif 21 <= driver_age <= 25:
        age_adj = 200.00
        age_label = "Driver Age Adjustment (21-25)"
        age_desc = "Under-25 risk surcharge"
    elif 26 <= driver_age <= 35:
        age_adj = 100.00
        age_label = "Driver Age Adjustment (26-35)"
        age_desc = "Standard young adult driver adjustment"
    elif 36 <= driver_age <= 60:
        age_adj = 0.00
        age_label = "Driver Age Adjustment (36-60)"
        age_desc = "Standard prime age tier (no surcharge)"
    else:
        age_adj = 150.00
        age_label = "Driver Age Adjustment (60+)"
        age_desc = "Senior driver risk adjustment"

    breakdown.append({
        "factor_name": age_label,
        "amount": age_adj,
        "category": "driver",
        "description": age_desc
    })

    # 4. Driving Experience Discount ($20/year up to max $300)
    discount_amount = round(min(driving_experience * 20.00, 300.00), 2)
    exp_factor_amount = -1.0 * discount_amount
    yrs_str = "yr" if driving_experience == 1 else "yrs"
    breakdown.append({
        "factor_name": f"Driving Experience Discount ({driving_experience} {yrs_str})",
        "amount": exp_factor_amount,
        "category": "experience",
        "description": f"${discount_amount:,.2f} discount earned for {driving_experience} {yrs_str} of clean driving experience"
    })

    # 5. Coverage Tier Surcharge
    norm_coverage = coverage_type.lower()
    if "comprehensive" in norm_coverage:
        cov_surcharge = 400.00
        cov_label = "Comprehensive Coverage Surcharge"
        cov_desc = "Full comprehensive protection tier surcharge"
    elif "fire" in norm_coverage or "theft" in norm_coverage:
        cov_surcharge = 200.00
        cov_label = "Third Party Fire & Theft Coverage Surcharge"
        cov_desc = "Third Party Fire and Theft risk surcharge"
    else:
        cov_surcharge = 0.00
        cov_label = "Third Party Basic Coverage"
        cov_desc = "Standard third-party liability basic tier (no surcharge)"

    breakdown.append({
        "factor_name": cov_label,
        "amount": cov_surcharge,
        "category": "coverage",
        "description": cov_desc
    })

    # 6. Total Calculation with $100 floor
    raw_total = base_premium + vehicle_loading + age_adj + exp_factor_amount + cov_surcharge
    total_premium = max(100.00, round(raw_total, 2))

    return {
        "base_premium": base_premium,
        "total_premium": total_premium,
        "breakdown": breakdown
    }

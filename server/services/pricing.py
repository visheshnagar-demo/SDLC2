from typing import Dict, Any, List


def calculate_rate_on_line(line_of_business: str, structure_type: str, target_rate: float | None = None) -> float:
    if target_rate is not None and target_rate > 0:
        return float(target_rate)

    lob = (line_of_business or "").lower()
    if "catastrophe" in lob or "property" in lob:
        base_rol = 3.75
    elif "cyber" in lob:
        base_rol = 4.20
    elif "marine" in lob or "energy" in lob:
        base_rol = 3.50
    else:
        base_rol = 3.25

    st = (structure_type or "").upper()
    if st == "STOP_LOSS":
        base_rol *= 1.15
    elif st == "QUOTA_SHARE":
        base_rol *= 0.90

    return round(base_rol, 2)


def calculate_ceding_commission(line_of_business: str, commission_override: float | None = None) -> float:
    if commission_override is not None and commission_override >= 0:
        return float(commission_override)

    lob = (line_of_business or "").lower()
    if "quota" in lob:
        return 20.00
    elif "marine" in lob:
        return 17.50
    elif "casualty" in lob:
        return 15.00
    return 12.50


def calculate_quoted_premium(sum_insured: float, rate_on_line: float) -> float:
    return round((sum_insured * rate_on_line) / 100.0, 2)


def generate_synthetic_layers(sum_insured: float, attachment_point: float, structure_type: str) -> List[Dict[str, Any]]:
    att = attachment_point or 0.0
    st = (structure_type or "").upper()

    if st == "EXCESS_OF_LOSS":
        layer1_limit = round(sum_insured * 0.4, 2)
        layer2_limit = round(sum_insured - layer1_limit, 2)
        return [
            {
                "layerNumber": 1,
                "attachment": att,
                "limit": layer1_limit,
                "genreSharePercentage": 100.0,
            },
            {
                "layerNumber": 2,
                "attachment": round(att + layer1_limit, 2),
                "limit": layer2_limit,
                "genreSharePercentage": 50.0,
            },
        ]
    else:
        return [
            {
                "layerNumber": 1,
                "attachment": att,
                "limit": sum_insured,
                "genreSharePercentage": 60.0,
            }
        ]

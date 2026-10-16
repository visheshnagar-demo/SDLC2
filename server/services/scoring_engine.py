from typing import Tuple, List, Dict, Any


def calculate_risk_score(submission: Any) -> Tuple[int, str]:
    """Calculate normalized risk score (0-100) and risk tier (LOW, MEDIUM, HIGH, CRITICAL)."""
    score = 50  # Base neutral score
    risk_type = (submission.risk_type or "").upper()
    risk_attrs = submission.risk_attributes or {}

    # 1. Loss History Evaluation
    loss_count = submission.prior_loss_count or 0
    loss_total = submission.prior_loss_total or 0.0
    limit_req = max(submission.limit_requested or 1.0, 1.0)

    if loss_count == 0:
        score -= 15
    elif loss_count <= 2:
        score += 10
    else:
        score += 25

    if loss_total > (limit_req * 0.5):
        score += 15

    # 2. Exposure & Leverage Ratio (Limit / Retention)
    retention = max(submission.retention or 1.0, 1.0)
    leverage_ratio = limit_req / retention
    if leverage_ratio > 10:
        score += 15
    elif leverage_ratio >= 5:
        score += 5
    else:
        score -= 10

    # 3. Industry Sector Risk
    sector = (submission.industry_sector or "").lower()
    high_risk_sectors = [
        "financial services",
        "healthcare",
        "biotechnology",
        "cryptocurrency",
        "aerospace",
    ]
    low_risk_sectors = ["education", "agriculture", "manufacturing", "real estate"]

    if any(s in sector for s in high_risk_sectors):
        score += 10
    elif any(s in sector for s in low_risk_sectors):
        score -= 5

    # 4. Line-of-Business Risk Attributes
    if risk_type == "CYBER":
        # Cyber security posture
        if risk_attrs.get("mfa_enabled") is True:
            score -= 10
        else:
            score += 20

        if risk_attrs.get("edr_deployed") is True:
            score -= 10
        else:
            score += 15

        backup_freq = str(risk_attrs.get("backup_frequency", "")).upper()
        if "DAILY" in backup_freq or "IMMUTABLE" in backup_freq:
            score -= 10
        else:
            score += 10

        if risk_attrs.get("encryption_at_rest") is True:
            score -= 5
        else:
            score += 10

        if int(risk_attrs.get("past_breaches", 0) or 0) > 0:
            score += 15

    elif risk_type in ["D_AND_O", "D&O"]:
        # D&O governance and exposure
        if risk_attrs.get("pending_litigation") is True:
            score += 25
        else:
            score -= 5

        debt_to_equity = float(risk_attrs.get("debt_to_equity_ratio", 1.0) or 1.0)
        if debt_to_equity > 2.0:
            score += 15
        elif debt_to_equity < 1.0:
            score -= 5

        board_exp = int(risk_attrs.get("board_experience_years", 5) or 5)
        if board_exp < 3:
            score += 15
        elif board_exp >= 10:
            score -= 10

        if risk_attrs.get("public_company") is True:
            score += 10

    # Clamp score to [0, 100]
    final_score = max(0, min(100, score))

    # Derive Tier
    if final_score <= 30:
        tier = "LOW"
    elif final_score <= 60:
        tier = "MEDIUM"
    elif final_score <= 80:
        tier = "HIGH"
    else:
        tier = "CRITICAL"

    return final_score, tier


def get_detailed_scoring_breakdown(submission: Any) -> Dict[str, Any]:
    """Generate detailed breakdown factors and recommendation for underwriter workbench."""
    score, tier = calculate_risk_score(submission)
    factors: List[Dict[str, Any]] = []

    loss_count = submission.prior_loss_count or 0
    loss_total = submission.prior_loss_total or 0.0
    limit_req = max(submission.limit_requested or 1.0, 1.0)
    retention = max(submission.retention or 1.0, 1.0)
    leverage = limit_req / retention
    risk_type = (submission.risk_type or "").upper()
    risk_attrs = submission.risk_attributes or {}

    # Loss history
    if loss_count == 0:
        factors.append(
            {
                "factor_name": "Loss History",
                "impact": "POSITIVE",
                "score_delta": -15,
                "description": "Clean 5-year loss record with zero reported claims.",
            }
        )
    elif loss_count <= 2:
        factors.append(
            {
                "factor_name": "Loss History",
                "impact": "NEGATIVE",
                "score_delta": 10,
                "description": f"Moderate claim frequency ({loss_count} prior claims total ${loss_total:,.2f}).",
            }
        )
    else:
        factors.append(
            {
                "factor_name": "Loss History",
                "impact": "NEGATIVE",
                "score_delta": 25,
                "description": f"Elevated claim frequency ({loss_count} prior claims total ${loss_total:,.2f}).",
            }
        )

    # Leverage
    if leverage > 10:
        factors.append(
            {
                "factor_name": "Underlying Retention Leverage",
                "impact": "NEGATIVE",
                "score_delta": 15,
                "description": f"High requested limit-to-retention leverage ratio ({leverage:.1f}x).",
            }
        )
    elif leverage >= 5:
        factors.append(
            {
                "factor_name": "Underlying Retention Leverage",
                "impact": "NEUTRAL",
                "score_delta": 5,
                "description": f"Moderate limit-to-retention leverage ratio ({leverage:.1f}x).",
            }
        )
    else:
        factors.append(
            {
                "factor_name": "Underlying Retention Leverage",
                "impact": "POSITIVE",
                "score_delta": -10,
                "description": f"Strong primary retention structure ({leverage:.1f}x leverage).",
            }
        )

    # Sector
    sector = (submission.industry_sector or "").lower()
    high_risk_sectors = [
        "financial services",
        "healthcare",
        "biotechnology",
        "cryptocurrency",
        "aerospace",
    ]
    if any(s in sector for s in high_risk_sectors):
        factors.append(
            {
                "factor_name": "Industry Sector Risk",
                "impact": "NEGATIVE",
                "score_delta": 10,
                "description": f"High risk exposure sector: {submission.industry_sector}.",
            }
        )

    # Risk type specifics
    if risk_type == "CYBER":
        if risk_attrs.get("mfa_enabled") is True:
            factors.append(
                {
                    "factor_name": "MFA Enforcement",
                    "impact": "POSITIVE",
                    "score_delta": -10,
                    "description": "Multi-factor authentication enforced enterprise-wide.",
                }
            )
        else:
            factors.append(
                {
                    "factor_name": "MFA Enforcement",
                    "impact": "NEGATIVE",
                    "score_delta": 20,
                    "description": "MFA is NOT enforced across all privileged access endpoints.",
                }
            )

        if risk_attrs.get("edr_deployed") is True:
            factors.append(
                {
                    "factor_name": "EDR & Threat Monitoring",
                    "impact": "POSITIVE",
                    "score_delta": -10,
                    "description": "Endpoint Detection and Response (EDR) active with 24/7 SOC.",
                }
            )
        else:
            factors.append(
                {
                    "factor_name": "EDR & Threat Monitoring",
                    "impact": "NEGATIVE",
                    "score_delta": 15,
                    "description": "No active automated EDR solution detected.",
                }
            )

    elif risk_type in ["D_AND_O", "D&O"]:
        if risk_attrs.get("pending_litigation") is True:
            factors.append(
                {
                    "factor_name": "Litigation Exposure",
                    "impact": "NEGATIVE",
                    "score_delta": 25,
                    "description": "Active or pending securities/management litigation declared.",
                }
            )
        else:
            factors.append(
                {
                    "factor_name": "Litigation Exposure",
                    "impact": "POSITIVE",
                    "score_delta": -5,
                    "description": "No active regulatory investigations or pending management litigation.",
                }
            )

    # Recommendation
    if tier == "LOW":
        recommendation = "Favorable risk profile. Fast-track binding quote at standard facultative pricing."
    elif tier == "MEDIUM":
        recommendation = "Standard risk profile. Proceed with standard facultative underwriting terms and subjectivities."
    elif tier == "HIGH":
        recommendation = "Elevated risk profile. Higher deductible/retention and restrictive subjectivities recommended."
    else:
        recommendation = "Critical risk exposure. Stringent underwriting review required; recommend declination or high attachment."

    return {
        "submission_id": submission.id,
        "risk_score": score,
        "risk_tier": tier,
        "base_score": 50,
        "factors": factors,
        "recommendation": recommendation,
    }

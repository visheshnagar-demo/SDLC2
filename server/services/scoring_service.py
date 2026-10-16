from typing import Dict, Any, Tuple


def get_risk_tier(score: int) -> str:
    if score <= 30:
        return "LOW"
    elif score <= 60:
        return "MEDIUM"
    elif score <= 80:
        return "HIGH"
    else:
        return "CRITICAL"


def score_cyber_risk(
    requested_limit: float,
    attachment_point: float,
    annual_revenue: float,
    industry_sector: str,
    risk_params: Dict[str, Any],
) -> Tuple[int, Dict[str, Any]]:
    breakdown = {}
    total_score = 10  # Baseline
    breakdown["baseline"] = 10

    # 1. Industry Sector Exposure
    high_risk_sectors = ["healthcare", "financial services", "banking", "critical infrastructure", "government", "fintech"]
    med_risk_sectors = ["technology", "retail", "manufacturing", "education", "hospitality"]
    sector_lower = (industry_sector or "").strip().lower()

    if any(s in sector_lower for s in high_risk_sectors):
        sector_score = 20
    elif any(s in sector_lower for s in med_risk_sectors):
        sector_score = 10
    else:
        sector_score = 5
    breakdown["industry_sector_score"] = sector_score
    total_score += sector_score

    # 2. Limit to Attachment Point Leverage Ratio
    ratio = requested_limit / max(attachment_point, 1.0)
    if ratio > 25:
        leverage_score = 20
    elif ratio > 10:
        leverage_score = 10
    else:
        leverage_score = 5
    breakdown["limit_retention_ratio_score"] = leverage_score
    breakdown["limit_retention_ratio"] = round(ratio, 2)
    total_score += leverage_score

    # 3. Security Controls
    controls_score = 0
    mfa_enforced = risk_params.get("mfa_enforced", False)
    if not mfa_enforced:
        controls_score += 25
        breakdown["mfa_missing_penalty"] = 25
    else:
        breakdown["mfa_enforced"] = True

    edr_deployed = risk_params.get("edr_deployed", False)
    if not edr_deployed:
        controls_score += 15
        breakdown["edr_missing_penalty"] = 15
    else:
        breakdown["edr_deployed"] = True

    backup_isolation = risk_params.get("backup_isolation", False)
    if not backup_isolation:
        controls_score += 15
        breakdown["backup_isolation_missing_penalty"] = 15
    else:
        breakdown["backup_isolation"] = True

    audit_recency = risk_params.get("security_audit_recency_months", 24)
    if audit_recency > 12:
        controls_score += 10
        breakdown["audit_outdated_penalty"] = 10
    breakdown["security_controls_score"] = controls_score
    total_score += controls_score

    # 4. Historical Breach Record
    prior_breaches = int(risk_params.get("prior_breaches_3yr", 0))
    breach_losses = float(risk_params.get("total_breach_losses", 0.0))
    breach_score = min(prior_breaches * 15, 30)
    if breach_losses > 1000000:
        breach_score += 10
    breakdown["breach_history_score"] = breach_score
    breakdown["prior_breaches_3yr"] = prior_breaches
    breakdown["total_breach_losses"] = breach_losses
    total_score += breach_score

    composite = max(0, min(100, total_score))
    return composite, breakdown


def score_dno_risk(
    requested_limit: float,
    attachment_point: float,
    annual_revenue: float,
    industry_sector: str,
    risk_params: Dict[str, Any],
) -> Tuple[int, Dict[str, Any]]:
    breakdown = {}
    total_score = 10  # Baseline
    breakdown["baseline"] = 10

    # 1. Industry Sector Volatility
    high_risk_sectors = ["biotechnology", "pharmaceuticals", "crypto", "banking", "mining", "fintech"]
    med_risk_sectors = ["technology", "real estate", "retail", "telecom", "healthcare"]
    sector_lower = (industry_sector or "").strip().lower()

    if any(s in sector_lower for s in high_risk_sectors):
        sector_score = 20
    elif any(s in sector_lower for s in med_risk_sectors):
        sector_score = 10
    else:
        sector_score = 5
    breakdown["industry_sector_score"] = sector_score
    total_score += sector_score

    # 2. Financial Solvency & Leverage
    debt_equity = float(risk_params.get("debt_to_equity_ratio", 1.0))
    solvency_score = 0
    if debt_equity > 3.0:
        solvency_score += 20
    elif debt_equity > 2.0:
        solvency_score += 10
    else:
        solvency_score += 0
    breakdown["debt_to_equity_score"] = solvency_score
    breakdown["debt_to_equity_ratio"] = debt_equity
    total_score += solvency_score

    # 3. Claims & Litigation History
    prior_claims = int(risk_params.get("prior_claims_3yr", 0))
    reg_investigations = int(risk_params.get("regulatory_investigations", 0))
    shareholder_suits = int(risk_params.get("shareholder_suits", 0))

    claims_score = min(prior_claims * 15, 30)
    if reg_investigations > 0:
        claims_score += 15
    if shareholder_suits > 0:
        claims_score += 20
    breakdown["litigation_history_score"] = claims_score
    breakdown["prior_claims_3yr"] = prior_claims
    breakdown["regulatory_investigations"] = reg_investigations
    breakdown["shareholder_suits"] = shareholder_suits
    total_score += claims_score

    # 4. Corporate Governance
    gov_score = 0
    board_tenure = float(risk_params.get("board_tenure_years", 5.0))
    if board_tenure < 2.0:
        gov_score += 10
        breakdown["short_board_tenure_penalty"] = 10

    independent_pct = float(risk_params.get("independent_board_pct", 75.0))
    if independent_pct < 50.0:
        gov_score += 15
        breakdown["low_board_independence_penalty"] = 15

    if not risk_params.get("has_governance_statement", True):
        gov_score += 10
        breakdown["missing_governance_statement_penalty"] = 10

    breakdown["governance_score"] = gov_score
    total_score += gov_score

    composite = max(0, min(100, total_score))
    return composite, breakdown


def calculate_risk_score(
    risk_type: str,
    requested_limit: float,
    attachment_point: float,
    annual_revenue: float,
    industry_sector: str,
    risk_parameters: Dict[str, Any] = None,
) -> Dict[str, Any]:
    params = risk_parameters or {}
    risk_type_normalized = (risk_type or "").upper()

    if risk_type_normalized == "CYBER":
        score, breakdown = score_cyber_risk(
            requested_limit=requested_limit,
            attachment_point=attachment_point,
            annual_revenue=annual_revenue,
            industry_sector=industry_sector,
            risk_params=params,
        )
    elif risk_type_normalized == "D_AND_O":
        score, breakdown = score_dno_risk(
            requested_limit=requested_limit,
            attachment_point=attachment_point,
            annual_revenue=annual_revenue,
            industry_sector=industry_sector,
            risk_params=params,
        )
    else:
        score = 50
        breakdown = {"baseline": 50, "note": "Unknown risk type default"}

    tier = get_risk_tier(score)
    return {
        "composite_score": score,
        "risk_tier": tier,
        "score_breakdown": breakdown,
    }

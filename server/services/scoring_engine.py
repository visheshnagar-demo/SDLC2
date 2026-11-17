from typing import Tuple, List, Dict, Any


def calculate_risk_score(
    risk_type: str,
    annual_revenue: float,
    sum_insured: float,
    attachment_point: float,
    prior_claims_count: int,
    prior_claims_total: float,
    security_governance_score: float,
    industry_segment: str,
) -> Tuple[float, str, List[Dict[str, Any]]]:
    """
    Algorithmic risk evaluation scoring engine for Cyber and D&O facultative reinsurance submissions.
    Returns (risk_score, risk_tier, rule_breakdowns).
    Score scale: 0 - 100.
    Tiers: LOW (< 40), MEDIUM (40-70), HIGH (> 70).
    """
    rules: List[Dict[str, Any]] = []
    current_score = 50.0

    rules.append(
        {
            "rule_key": "BASE_BASELINE",
            "rule_name": "Base Facultative Reinsurance Risk Baseline",
            "score_delta": 50.0,
            "rationale": "Initial standard baseline rating for facultative placement risk",
        }
    )

    norm_risk_type = (risk_type or "").upper().replace("&", "_AND_").replace(" ", "_")

    if "CYBER" in norm_risk_type:
        # Cyber Risk Specific Scoring
        if security_governance_score < 40.0:
            delta = 25.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "CYBER_GOVERNANCE_CRITICAL",
                    "rule_name": "Critical Cyber Security Governance Deficit",
                    "score_delta": delta,
                    "rationale": f"Security score ({security_governance_score:.1f}) is below 40 threshold indicating elevated vulnerability",
                }
            )
        elif security_governance_score < 65.0:
            delta = 10.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "CYBER_GOVERNANCE_SUBOPTIMAL",
                    "rule_name": "Sub-optimal Cyber Security Maturity",
                    "score_delta": delta,
                    "rationale": f"Security score ({security_governance_score:.1f}) indicates moderate gap in zero-trust controls",
                }
            )
        elif security_governance_score >= 80.0:
            delta = -15.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "CYBER_GOVERNANCE_EXEMPLARY",
                    "rule_name": "Strong Cyber Defense & Governance Posture",
                    "score_delta": delta,
                    "rationale": f"Security score ({security_governance_score:.1f}) demonstrates comprehensive enterprise defense controls",
                }
            )

        # Claims severity
        if prior_claims_count > 0:
            if prior_claims_total > 500000.0 or prior_claims_count >= 2:
                delta = 20.0
                current_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_CLAIMS_SEVERE",
                        "rule_name": "Severe Prior Cyber Loss Experience",
                        "score_delta": delta,
                        "rationale": f"History of {prior_claims_count} prior claims totaling ${prior_claims_total:,.2f}",
                    }
                )
            else:
                delta = 10.0
                current_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_CLAIMS_MODERATE",
                        "rule_name": "Moderate Prior Cyber Loss Record",
                        "score_delta": delta,
                        "rationale": f"Record of {prior_claims_count} prior claim(s) totaling ${prior_claims_total:,.2f}",
                    }
                )

        # Industry Vulnerability
        high_risk_industries = [
            "healthcare",
            "financial services",
            "finance",
            "critical infrastructure",
            "retail",
            "tech",
        ]
        if any(h in (industry_segment or "").lower() for h in high_risk_industries):
            delta = 15.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "CYBER_INDUSTRY_EXPOSURE",
                    "rule_name": "High Vulnerability Industry Sector",
                    "score_delta": delta,
                    "rationale": f"Industry segment '{industry_segment}' is historically subject to frequent ransomware and data breach targeting",
                }
            )

        # Attachment Buffer Ratio
        if sum_insured > 0 and (attachment_point / sum_insured) < 0.10:
            delta = 10.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "ATTACHMENT_BUFFER_LOW",
                    "rule_name": "Low Attachment Point Buffer",
                    "score_delta": delta,
                    "rationale": f"Attachment point (${attachment_point:,.2f}) represents under 10% of sum insured (${sum_insured:,.2f})",
                }
            )

    else:
        # D&O Risk Specific Scoring
        if annual_revenue > 100000000.0:
            delta = 15.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "DO_LARGE_CAP_EXPOSURE",
                    "rule_name": "Large Cap Revenue Exposure",
                    "score_delta": delta,
                    "rationale": f"Annual revenue (${annual_revenue:,.2f}) exceeds $100M threshold elevating public/management liability litigation risk",
                }
            )

        if prior_claims_count > 0:
            delta = 20.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "DO_PRIOR_LITIGATION",
                    "rule_name": "Prior D&O Litigation History",
                    "score_delta": delta,
                    "rationale": f"{prior_claims_count} prior management liability / D&O claims recorded totaling ${prior_claims_total:,.2f}",
                }
            )

        if security_governance_score < 50.0:
            delta = 15.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "DO_GOVERNANCE_DEFICIT",
                    "rule_name": "Corporate Governance & Board Oversight Deficit",
                    "score_delta": delta,
                    "rationale": f"Corporate governance score ({security_governance_score:.1f}) reflects insufficient compliance controls",
                }
            )
        elif security_governance_score >= 80.0:
            delta = -15.0
            current_score += delta
            rules.append(
                {
                    "rule_key": "DO_GOVERNANCE_EXCELLENCE",
                    "rule_name": "Exemplary Board Governance & Compliance Rating",
                    "score_delta": delta,
                    "rationale": f"Governance rating ({security_governance_score:.1f}) exceeds top compliance tier standards",
                }
            )

    # Clamp score to [0.0, 100.0]
    final_score = max(0.0, min(100.0, float(current_score)))

    # Determine risk tier
    if final_score < 40.0:
        risk_tier = "LOW"
    elif final_score <= 70.0:
        risk_tier = "MEDIUM"
    else:
        risk_tier = "HIGH"

    return final_score, risk_tier, rules

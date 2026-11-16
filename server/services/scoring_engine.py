from typing import Dict, Any, List, Tuple


def evaluate_risk(
    submission_data: Dict[str, Any],
) -> Tuple[float, str, List[Dict[str, Any]]]:
    risk_type = (submission_data.get("risk_type") or "CYBER").upper()
    annual_revenue = float(submission_data.get("annual_revenue") or 0.0)
    sum_insured = float(submission_data.get("sum_insured") or 0.0)
    attachment_point = float(submission_data.get("attachment_point") or 0.0)
    prior_claims_count = int(submission_data.get("prior_claims_count") or 0)
    prior_claims_total = float(submission_data.get("prior_claims_total") or 0.0)
    security_score = submission_data.get("security_governance_score")
    industry = (submission_data.get("industry_segment") or "").strip()

    breakdowns: List[Dict[str, Any]] = []
    base_score = 40.0
    total_score = base_score

    breakdowns.append(
        {
            "rule_key": "BASE_SCORE",
            "rule_name": "Base Underwriting Risk Score",
            "score_delta": base_score,
            "rationale": "Initial baseline baseline score for commercial facultative risk placement.",
        }
    )

    if "CYBER" in risk_type:
        # Security Governance
        if security_score is None:
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_GOVERNANCE_MISSING",
                    "rule_name": "Security Governance Assessment Missing",
                    "score_delta": delta,
                    "rationale": "Cyber security controls and hygiene assessment not provided by carrier.",
                }
            )
        elif security_score < 50:
            delta = 25.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_LOW_SECURITY_SCORE",
                    "rule_name": "Deficient Cyber Security Posture",
                    "score_delta": delta,
                    "rationale": f"Reported security score ({security_score}/100) indicates significant vulnerability.",
                }
            )
        elif security_score >= 80:
            delta = -15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_HIGH_SECURITY_SCORE",
                    "rule_name": "Strong Security Hygiene & Controls",
                    "score_delta": delta,
                    "rationale": f"Reported security score ({security_score}/100) meets top-tier cybersecurity standards.",
                }
            )
        else:
            delta = 0.0
            breakdowns.append(
                {
                    "rule_key": "CYBER_MODERATE_SECURITY_SCORE",
                    "rule_name": "Moderate Cyber Security Governance",
                    "score_delta": delta,
                    "rationale": f"Reported security score ({security_score}/100) reflects standard baseline posture.",
                }
            )

        # Claims History
        if prior_claims_count > 2:
            delta = 20.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_HIGH_CLAIM_COUNT",
                    "rule_name": "Frequent Cyber Loss History",
                    "score_delta": delta,
                    "rationale": f"Insured has recorded {prior_claims_count} cyber incidents in past policy periods.",
                }
            )
        elif prior_claims_count > 0:
            delta = 10.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_MODERATE_CLAIM_COUNT",
                    "rule_name": "Prior Cyber Incident History",
                    "score_delta": delta,
                    "rationale": f"Insured has recorded {prior_claims_count} prior cyber incident.",
                }
            )

        if prior_claims_total > 1_000_000:
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_HIGH_CLAIM_SEVERITY",
                    "rule_name": "Severe Prior Cyber Losses",
                    "score_delta": delta,
                    "rationale": f"Total historical cyber losses of ${prior_claims_total:,.2f} exceed $1M benchmark.",
                }
            )

        # Industry
        high_risk_cyber = [
            "healthcare",
            "financial services",
            "banking",
            "technology",
            "crypto",
            "retail",
            "energy",
        ]
        if any(h in industry.lower() for h in high_risk_cyber):
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_HIGH_RISK_INDUSTRY",
                    "rule_name": "High-Target Cyber Industry",
                    "score_delta": delta,
                    "rationale": f"Operating in '{industry}', a sector with heightened ransomware/breach exposure.",
                }
            )

        # Attachment point & limit
        if attachment_point < 500_000:
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_LOW_ATTACHMENT",
                    "rule_name": "Low Primary Attachment Point",
                    "score_delta": delta,
                    "rationale": f"Attachment point of ${attachment_point:,.2f} exposes reinsurer to primary working losses.",
                }
            )
        elif attachment_point < 1_000_000:
            delta = 10.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_MODERATE_ATTACHMENT",
                    "rule_name": "Sub-$1M Attachment Point",
                    "score_delta": delta,
                    "rationale": f"Attachment point of ${attachment_point:,.2f} provides moderate excess buffer.",
                }
            )

        if sum_insured > 20_000_000:
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "CYBER_LARGE_SUM_INSURED",
                    "rule_name": "Substantial Capacity Request",
                    "score_delta": delta,
                    "rationale": f"Requested policy limit of ${sum_insured:,.2f} requires high risk aggregation monitoring.",
                }
            )
    else:
        # D&O Rules
        if annual_revenue > 500_000_000:
            delta = 20.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_LARGE_CORPORATE_EXPOSURE",
                    "rule_name": "High Corporate Revenue Exposure",
                    "score_delta": delta,
                    "rationale": f"Annual revenue of ${annual_revenue:,.2f} indicates large enterprise complexity.",
                }
            )
        elif annual_revenue > 100_000_000:
            delta = 10.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_MID_MARKET_EXPOSURE",
                    "rule_name": "Mid-Market Enterprise Exposure",
                    "score_delta": delta,
                    "rationale": f"Annual revenue of ${annual_revenue:,.2f} indicates elevated operational footprint.",
                }
            )

        # Claims / Litigation
        if prior_claims_count > 1:
            delta = 25.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_REPEAT_LITIGATION",
                    "rule_name": "Multiple Prior D&O Claims",
                    "score_delta": delta,
                    "rationale": f"Insured has {prior_claims_count} prior management liability or securities actions.",
                }
            )
        elif prior_claims_count > 0:
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_PRIOR_LITIGATION",
                    "rule_name": "Prior D&O Claim History",
                    "score_delta": delta,
                    "rationale": f"Insured has {prior_claims_count} prior management liability claim.",
                }
            )

        if prior_claims_total > 2_000_000:
            delta = 20.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_SEVERE_PRIOR_SETTLEMENTS",
                    "rule_name": "High Historical Loss Severity",
                    "score_delta": delta,
                    "rationale": f"Historical D&O losses total ${prior_claims_total:,.2f}.",
                }
            )

        # Industry
        high_risk_do = [
            "biotechnology",
            "pharmaceutical",
            "crypto",
            "banking",
            "fintech",
            "spac",
            "real estate",
        ]
        if any(h in industry.lower() for h in high_risk_do):
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_HIGH_LITIGATION_SECTOR",
                    "rule_name": "High Securities Litigation Sector",
                    "score_delta": delta,
                    "rationale": f"Operating in '{industry}', known for high securities class action exposure.",
                }
            )

        if attachment_point < 1_000_000:
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_LOW_ATTACHMENT",
                    "rule_name": "Low Excess Attachment Point",
                    "score_delta": delta,
                    "rationale": f"Attachment point of ${attachment_point:,.2f} exposes policy to early dispute defense costs.",
                }
            )

        if sum_insured > 25_000_000:
            delta = 15.0
            total_score += delta
            breakdowns.append(
                {
                    "rule_key": "DO_LARGE_SUM_INSURED",
                    "rule_name": "Substantial Capacity Request",
                    "score_delta": delta,
                    "rationale": f"Requested limit of ${sum_insured:,.2f} exceeds standard automated treaty limits.",
                }
            )

    # Clamp total score between 5.0 and 95.0
    final_score = max(5.0, min(95.0, round(total_score, 1)))

    if final_score < 40.0:
        risk_tier = "LOW"
    elif final_score < 70.0:
        risk_tier = "MEDIUM"
    else:
        risk_tier = "HIGH"

    return final_score, risk_tier, breakdowns

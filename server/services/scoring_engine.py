from typing import Tuple, List, Dict, Any


class ScoringEngine:
    @staticmethod
    def evaluate_risk(
        risk_type: str,
        annual_revenue: float,
        sum_insured: float,
        attachment_point: float,
        prior_claims_count: int,
        prior_claims_total: float,
        security_governance_score: float | None,
        industry_segment: str,
    ) -> Tuple[int, str, List[Dict[str, Any]]]:
        rules: List[Dict[str, Any]] = []
        raw_score = 20  # Baseline base score
        rules.append(
            {
                "rule_key": "BASELINE_SCORE",
                "rule_name": "Base Commercial Risk Exposure",
                "score_delta": 20,
                "rationale": "Initial baseline risk rating for facultative placement underwriting.",
            }
        )

        risk_type_upper = (risk_type or "").upper()

        if risk_type_upper == "CYBER":
            # 1. Attachment point cushion
            if sum_insured > 0 and (attachment_point / sum_insured) < 0.25:
                delta = 20
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_LOW_ATTACHMENT",
                        "rule_name": "Low Attachment Point Cushion",
                        "score_delta": delta,
                        "rationale": f"Attachment point (${attachment_point:,.0f}) is below 25% of sum insured (${sum_insured:,.0f}), increasing early loss exposure.",
                    }
                )
            else:
                delta = -5
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_ADEQUATE_ATTACHMENT",
                        "rule_name": "Adequate Attachment Point Buffer",
                        "score_delta": delta,
                        "rationale": f"Attachment point (${attachment_point:,.0f}) provides sufficient primary loss insulation.",
                    }
                )

            # 2. Limit to Revenue ratio
            if annual_revenue > 0 and (sum_insured / annual_revenue) > 0.15:
                delta = 15
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_HIGH_REVENUE_EXPOSURE",
                        "rule_name": "High Limit-to-Revenue Ratio",
                        "score_delta": delta,
                        "rationale": f"Requested limit (${sum_insured:,.0f}) exceeds 15% of annual revenue (${annual_revenue:,.0f}).",
                    }
                )

            # 3. Claims history
            if prior_claims_count >= 2 or prior_claims_total > 500000:
                delta = 25
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_ELEVATED_CLAIMS",
                        "rule_name": "Elevated Cyber Claims Frequency/Severity",
                        "score_delta": delta,
                        "rationale": f"{prior_claims_count} prior claims totaling ${prior_claims_total:,.2f} recorded in recent history.",
                    }
                )
            elif prior_claims_count == 1 or prior_claims_total > 0:
                delta = 15
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_MODERATE_CLAIMS",
                        "rule_name": "Single Prior Loss Incident",
                        "score_delta": delta,
                        "rationale": f"1 prior claim totaling ${prior_claims_total:,.2f} recorded.",
                    }
                )
            else:
                delta = -10
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_CLEAN_LOSS_RECORD",
                        "rule_name": "Clean Cyber Loss Record",
                        "score_delta": delta,
                        "rationale": "Zero historical ransomware or data breach loss events in past 5 years.",
                    }
                )

            # 4. Security Hygiene Score
            if security_governance_score is None:
                delta = 15
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_NO_HYGIENE_SCORE",
                        "rule_name": "Missing Security Hygiene Assessment",
                        "score_delta": delta,
                        "rationale": "No self-reported cybersecurity hygiene score was provided.",
                    }
                )
            elif security_governance_score < 60:
                delta = 20
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_POOR_HYGIENE",
                        "rule_name": "Substandard Security Hygiene",
                        "score_delta": delta,
                        "rationale": f"Security hygiene score of {security_governance_score:.1f}/100 indicates vulnerabilities in MFA or backup protocols.",
                    }
                )
            elif security_governance_score >= 80:
                delta = -10
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_STRONG_HYGIENE",
                        "rule_name": "Robust Security Controls",
                        "score_delta": delta,
                        "rationale": f"Security score of {security_governance_score:.1f}/100 demonstrates advanced EDR, MFA, and immutable backups.",
                    }
                )

            # 5. Industry Segment Risk
            high_risk_industries = {
                "technology",
                "healthcare",
                "financial services",
                "finance",
                "retail",
            }
            if (industry_segment or "").lower() in high_risk_industries:
                delta = 10
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "CYBER_TARGET_INDUSTRY",
                        "rule_name": "High-Target Industry Segment",
                        "score_delta": delta,
                        "rationale": f"Sector '{industry_segment}' carries heightened systemic vulnerability to extortion and data exfiltration.",
                    }
                )

        else:
            # D&O Scoring Model
            # 1. Limit vs Revenue scale
            if annual_revenue > 0 and (sum_insured / annual_revenue) > 0.10:
                delta = 20
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "DNO_HIGH_CAPACITY_EXPOSURE",
                        "rule_name": "High D&O Capacity Exposure",
                        "score_delta": delta,
                        "rationale": f"Requested limit (${sum_insured:,.0f}) is over 10% of insured annual revenue (${annual_revenue:,.0f}).",
                    }
                )

            # 2. Retention cushion
            if sum_insured > 0 and (attachment_point / sum_insured) < 0.20:
                delta = 15
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "DNO_LOW_RETENTION",
                        "rule_name": "Low Primary Retention Buffer",
                        "score_delta": delta,
                        "rationale": f"Attachment point (${attachment_point:,.0f}) is below 20% of requested limit (${sum_insured:,.0f}).",
                    }
                )
            else:
                delta = -5
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "DNO_ADEQUATE_RETENTION",
                        "rule_name": "Adequate Primary Retention",
                        "score_delta": delta,
                        "rationale": f"Attachment point (${attachment_point:,.0f}) provides solid buffer against early shareholder actions.",
                    }
                )

            # 3. Claims / Litigation History
            if prior_claims_count > 1 or prior_claims_total > 1000000:
                delta = 30
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "DNO_ADVERSE_LITIGATION",
                        "rule_name": "Adverse Prior Litigation / Claims",
                        "score_delta": delta,
                        "rationale": f"{prior_claims_count} prior D&O claims totaling ${prior_claims_total:,.2f} indicate recurring governance exposures.",
                    }
                )
            elif prior_claims_count == 1 or prior_claims_total > 0:
                delta = 15
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "DNO_MODERATE_LITIGATION",
                        "rule_name": "Single Prior D&O Event",
                        "score_delta": delta,
                        "rationale": f"1 prior claim totaling ${prior_claims_total:,.2f}.",
                    }
                )
            else:
                delta = -10
                raw_score += delta
                rules.append(
                    {
                        "rule_key": "DNO_CLEAN_LOSS_HISTORY",
                        "rule_name": "Clean Loss History",
                        "score_delta": delta,
                        "rationale": "Zero director & officer loss events or regulatory investigations in past 5 years.",
                    }
                )

            # 4. Corporate Governance Rating
            if security_governance_score is not None:
                if security_governance_score >= 80:
                    delta = -10
                    raw_score += delta
                    rules.append(
                        {
                            "rule_key": "DNO_STRONG_GOVERNANCE",
                            "rule_name": "High Governance Rating",
                            "score_delta": delta,
                            "rationale": f"Governance rating of {security_governance_score:.1f}/100 reflects strong board independence.",
                        }
                    )
                elif security_governance_score < 60:
                    delta = 15
                    raw_score += delta
                    rules.append(
                        {
                            "rule_key": "DNO_WEAK_GOVERNANCE",
                            "rule_name": "Weak Governance Framework",
                            "score_delta": delta,
                            "rationale": f"Governance rating of {security_governance_score:.1f}/100 indicates board oversight risks.",
                        }
                    )

        # Clamp final score
        final_score = max(0, min(100, raw_score))

        if final_score < 40:
            risk_tier = "LOW"
        elif final_score < 70:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "HIGH"

        return final_score, risk_tier, rules

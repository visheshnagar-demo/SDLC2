from typing import Dict, Any, Optional
from server import models


class RiskScoringEngine:
    """
    Automated Risk Scoring Engine evaluating facultative reinsurance submissions
    for Cyber and D&O risks.
    """

    @classmethod
    def calculate_score(
        cls,
        submission: models.ReinsuranceSubmission,
        profile: Optional[models.RiskProfile] = None,
        documents: Optional[list] = None,
    ) -> Dict[str, Any]:
        risk_type = (submission.risk_type or "").upper()
        req_limit = float(submission.requested_reinsurance_limit or 0.0)
        primary_limit = float(submission.primary_policy_limit or 1.0)
        attach_point = float(submission.attachment_point or 0.0)
        revenue = float(submission.annual_revenue or 1.0)

        # 1. Exposure Score (0 - 100)
        limit_ratio = min(req_limit / max(primary_limit, 1.0), 1.0)
        attach_ratio = min(attach_point / max(primary_limit, 1.0), 1.0)
        revenue_exposure = min((req_limit / max(revenue, 1.0)) * 10.0, 1.0)

        # Higher limit ratio & lower attachment point -> higher exposure risk
        exposure_score = (
            (limit_ratio * 50.0)
            + ((1.0 - attach_ratio) * 30.0)
            + (revenue_exposure * 20.0)
        )
        exposure_score = round(min(max(exposure_score, 10.0), 98.0), 1)

        # 2. Loss History Score (0 - 100)
        claims = profile.claims_count_3yr if profile else 0
        losses = float(profile.total_losses_3yr if profile else 0.0)

        loss_ratio = min(losses / max(req_limit * 0.1, 100000.0), 2.0) / 2.0
        claims_factor = min(claims * 20.0, 60.0)
        loss_history_score = (claims_factor * 0.5) + (loss_ratio * 50.0)
        loss_history_score = round(min(max(loss_history_score, 10.0), 95.0), 1)

        # 3. Governance / Security Controls Score (0 - 100) (Higher score = higher risk/weaker controls)
        if "CYBER" in risk_type:
            mfa = profile.mfa_enforced if profile else False
            backup = profile.backup_immutable if profile else False
            framework = bool(profile.security_framework) if profile else False

            gov_points = 100.0
            if mfa:
                gov_points -= 35.0
            if backup:
                gov_points -= 30.0
            if framework:
                gov_points -= 25.0
            governance_score = round(min(max(gov_points, 10.0), 95.0), 1)
        else:  # D_AND_O
            gov_score = float(profile.board_governance_score if profile else 50.0)
            reg_action = profile.regulatory_enforcement_action if profile else False

            # Convert good governance (high score) to low risk score
            base_risk = 100.0 - gov_score
            if reg_action:
                base_risk += 30.0
            governance_score = round(min(max(base_risk, 10.0), 95.0), 1)

        # 4. Completeness Score (0 - 100)
        completeness = 50.0
        if profile is not None:
            completeness += 25.0
        if documents and len(documents) > 0:
            completeness += min(len(documents) * 15.0, 25.0)
        completeness_score = round(min(max(completeness, 20.0), 100.0), 1)

        # 5. Composite Score (0 - 100)
        # Weighted average
        composite = (
            (exposure_score * 0.35)
            + (loss_history_score * 0.25)
            + (governance_score * 0.25)
            + ((100.0 - completeness_score) * 0.15)
        )
        composite_score = round(min(max(composite, 5.0), 99.0), 1)

        # 6. Risk Tier
        if composite_score <= 30.0:
            risk_tier = "LOW"
        elif composite_score <= 60.0:
            risk_tier = "MEDIUM"
        elif composite_score <= 80.0:
            risk_tier = "HIGH"
        else:
            risk_tier = "CRITICAL"

        benchmark_delta = round(composite_score - 50.0, 1)

        notes = f"Risk evaluated for {risk_type}. Exposure: {exposure_score}, Loss History: {loss_history_score}, Controls: {governance_score}, Completeness: {completeness_score}%."

        return {
            "composite_score": composite_score,
            "completeness_score": completeness_score,
            "exposure_score": exposure_score,
            "loss_history_score": loss_history_score,
            "governance_score": governance_score,
            "risk_tier": risk_tier,
            "benchmark_delta": benchmark_delta,
            "notes": notes,
        }

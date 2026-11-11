from typing import Dict, Any, Tuple
from server.models.submission import Submission
from server.models.risk_profile import CyberRiskProfile, DoRiskProfile


def get_risk_tier(score: float) -> str:
    if score < 40.0:
        return "LOW"
    elif score < 70.0:
        return "MEDIUM"
    elif score < 90.0:
        return "HIGH"
    else:
        return "CRITICAL"


def calculate_risk_score(
    submission: Submission,
) -> Tuple[float, str, Dict[str, Any], bool]:
    """
    Computes a normalized risk score (0-100) and risk tier based on risk attributes.
    Returns: (calculated_score, risk_tier, scoring_breakdown, is_calibrated)
    """
    if submission.risk_type == "CYBER":
        profile: CyberRiskProfile = submission.cyber_profile
        if not profile:
            return (
                50.0,
                "MEDIUM",
                {"baseline_reason": "No cyber profile provided - baseline applied"},
                False,
            )

        breakdown = {"base_score": 15.0}
        total = 15.0

        if not profile.has_mfa_admin_accounts:
            total += 25.0
            breakdown["missing_admin_mfa_penalty"] = 25.0
        if not profile.has_mfa_email:
            total += 15.0
            breakdown["missing_email_mfa_penalty"] = 15.0
        if not profile.has_mfa_remote_access:
            total += 15.0
            breakdown["missing_remote_mfa_penalty"] = 15.0
        if not profile.has_immutable_backups:
            total += 20.0
            breakdown["missing_immutable_backups_penalty"] = 20.0
        if not profile.has_edr_deployed:
            total += 15.0
            breakdown["missing_edr_penalty"] = 15.0

        if profile.prior_ransomware_claims > 0:
            claims_penalty = min(30.0, profile.prior_ransomware_claims * 15.0)
            total += claims_penalty
            breakdown["prior_ransomware_claims_penalty"] = claims_penalty

        if profile.record_count > 5000000:
            total += 20.0
            breakdown["high_record_volume_penalty"] = 20.0
        elif profile.record_count > 1000000:
            total += 10.0
            breakdown["moderate_record_volume_penalty"] = 10.0

        if submission.primary_limit > 0 and submission.attachment_point < (
            submission.primary_limit * 0.5
        ):
            total += 10.0
            breakdown["low_attachment_point_penalty"] = 10.0

        final_score = round(min(100.0, max(0.0, total)), 2)
        tier = get_risk_tier(final_score)
        return final_score, tier, breakdown, True

    elif submission.risk_type == "DO":
        profile: DoRiskProfile = submission.do_profile
        if not profile:
            return (
                50.0,
                "MEDIUM",
                {"baseline_reason": "No D&O profile provided - baseline applied"},
                False,
            )

        breakdown = {"base_score": 15.0}
        total = 15.0

        if profile.debt_to_equity_ratio > 4.0:
            total += 30.0
            breakdown["severe_leverage_penalty"] = 30.0
        elif profile.debt_to_equity_ratio > 2.0:
            total += 15.0
            breakdown["elevated_leverage_penalty"] = 15.0

        if profile.executive_turnover_count > 3:
            total += 30.0
            breakdown["severe_executive_turnover_penalty"] = 30.0
        elif profile.executive_turnover_count > 1:
            total += 15.0
            breakdown["elevated_executive_turnover_penalty"] = 15.0

        if profile.pending_litigation_flag:
            total += 25.0
            breakdown["pending_litigation_penalty"] = 25.0

        if profile.prior_securities_claims > 0:
            securities_penalty = min(30.0, profile.prior_securities_claims * 15.0)
            total += securities_penalty
            breakdown["prior_securities_claims_penalty"] = securities_penalty

        if not profile.has_board_oversight_charter:
            total += 20.0
            breakdown["missing_board_oversight_penalty"] = 20.0

        if profile.company_structure.upper() == "PUBLIC":
            total += 10.0
            breakdown["public_company_exposure_penalty"] = 10.0

        if submission.primary_limit > 0 and submission.attachment_point < (
            submission.primary_limit * 0.5
        ):
            total += 10.0
            breakdown["low_attachment_point_penalty"] = 10.0

        final_score = round(min(100.0, max(0.0, total)), 2)
        tier = get_risk_tier(final_score)
        return final_score, tier, breakdown, True

    return (
        50.0,
        "MEDIUM",
        {"baseline_reason": "Unknown risk type - baseline applied"},
        False,
    )

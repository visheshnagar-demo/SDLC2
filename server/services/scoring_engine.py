from typing import List, Dict, Any, Optional
from server.models import ReinsuranceSubmission, RiskProfile, SubmissionDocument


def calculate_risk_score(
    submission: ReinsuranceSubmission,
    risk_profile: Optional[RiskProfile] = None,
    documents: Optional[List[SubmissionDocument]] = None,
    flags: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Computes weighted composite risk score (0-100) and risk tier classification.
    Returns:
      overall_score: float (0.0 to 100.0)
      completeness_score: float (0.0 to 100.0)
      exposure_score: float (0.0 to 100.0)
      loss_score: float (0.0 to 100.0)
      governance_score: float (0.0 to 100.0)
      risk_tier: str (PREFERRED | MODERATE_RISK | HIGH_RISK)
      scoring_breakdown: Dict[str, Any]
    """
    active_flags = flags or []

    # 1. Completeness Score (Weight: 0.30)
    high_flags = sum(
        1
        for f in active_flags
        if f.get("flag_severity") == "HIGH" and not f.get("is_resolved")
    )
    med_flags = sum(
        1
        for f in active_flags
        if f.get("flag_severity") == "MEDIUM" and not f.get("is_resolved")
    )
    low_flags = sum(
        1
        for f in active_flags
        if f.get("flag_severity") == "LOW" and not f.get("is_resolved")
    )

    raw_completeness = (
        100.0 - (high_flags * 20.0) - (med_flags * 10.0) - (low_flags * 5.0)
    )
    completeness_score = max(0.0, min(100.0, raw_completeness))
    if high_flags > 0:
        completeness_score = round(completeness_score * 0.8, 2)

    # 2. Exposure Score (Weight: 0.25)
    primary_limit = max(1.0, float(submission.primary_policy_limit or 1.0))
    attachment = float(submission.attachment_point or 0.0)
    requested_limit = float(submission.requested_reinsurance_limit or 0.0)

    # Attachment ratio relative to primary limit
    attachment_ratio = attachment / primary_limit
    if attachment_ratio >= 1.0:
        base_exp = 95.0
    elif attachment_ratio >= 0.5:
        base_exp = 80.0
    elif attachment_ratio >= 0.25:
        base_exp = 60.0
    elif attachment_ratio > 0.0:
        base_exp = 45.0
    else:
        base_exp = 30.0

    # Limit leverage penalty/bonus
    limit_ratio = requested_limit / primary_limit
    if limit_ratio <= 0.5:
        base_exp += 5.0
    elif limit_ratio > 2.0:
        base_exp -= 15.0

    exposure_score = max(0.0, min(100.0, base_exp))

    # 3. Loss History Score (Weight: 0.25)
    prior_losses = risk_profile.prior_losses_count if risk_profile else 0
    total_loss_amt = (
        float(risk_profile.total_loss_amount or 0.0) if risk_profile else 0.0
    )
    pending_claims = bool(risk_profile.has_pending_claims) if risk_profile else False

    if prior_losses == 0 and total_loss_amt == 0:
        loss_score = 100.0
    elif prior_losses == 1:
        loss_score = 75.0 if total_loss_amt < 100_000 else 50.0
    elif prior_losses == 2:
        loss_score = 50.0 if total_loss_amt < 250_000 else 35.0
    else:
        loss_score = 25.0 if total_loss_amt < 1_000_000 else 10.0

    if pending_claims:
        loss_score = max(0.0, loss_score - 25.0)

    loss_score = max(0.0, min(100.0, loss_score))

    # 4. Governance & Security Score (Weight: 0.20)
    risk_type = (submission.risk_type or "").upper()
    gov_score = 0.0

    if risk_type == "CYBER":
        if risk_profile and risk_profile.mfa_enforced:
            gov_score += 40.0
        if risk_profile and risk_profile.has_offline_backups:
            gov_score += 30.0
        if risk_profile and risk_profile.security_framework:
            fw = risk_profile.security_framework.upper()
            if any(k in fw for k in ("SOC2", "ISO", "NIST", "CIS", "HITRUST")):
                gov_score += 30.0
            else:
                gov_score += 15.0
    else:
        # D&O Governance Scoring
        if not pending_claims:
            gov_score += 40.0
        rev = float(submission.annual_revenue or 0.0)
        if rev >= 50_000_000:
            gov_score += 30.0
        elif rev >= 10_000_000:
            gov_score += 20.0
        else:
            gov_score += 10.0

        industry = (submission.industry_sector or "").lower()
        if any(
            sec in industry
            for sec in ("manufacturing", "utilities", "retail", "agriculture")
        ):
            gov_score += 30.0
        elif any(sec in industry for sec in ("financial", "tech", "healthcare")):
            gov_score += 20.0
        else:
            gov_score += 15.0

    governance_score = max(0.0, min(100.0, gov_score))

    # Composite Score Formula
    composite = (
        (0.30 * completeness_score)
        + (0.25 * exposure_score)
        + (0.25 * loss_score)
        + (0.20 * governance_score)
    )
    overall_score = round(composite, 2)

    # Risk Tier Classification
    if overall_score >= 70.0:
        risk_tier = "PREFERRED"
    elif overall_score >= 40.0:
        risk_tier = "MODERATE_RISK"
    else:
        risk_tier = "HIGH_RISK"

    breakdown = {
        "completeness_weight": 0.30,
        "exposure_weight": 0.25,
        "loss_weight": 0.25,
        "governance_weight": 0.20,
        "attachment_ratio": round(attachment_ratio, 2),
        "prior_losses_count": prior_losses,
        "total_loss_amount": total_loss_amt,
        "high_severity_flags_count": high_flags,
    }

    return {
        "overall_score": overall_score,
        "completeness_score": completeness_score,
        "exposure_score": exposure_score,
        "loss_score": loss_score,
        "governance_score": governance_score,
        "risk_tier": risk_tier,
        "scoring_breakdown": breakdown,
    }

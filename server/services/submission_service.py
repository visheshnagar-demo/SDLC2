from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from server.models.submission import Submission
from server.models.risk_profile import CyberRiskProfile, DoRiskProfile
from server.models.evaluation import RiskScore, MissingInfoFlag, UnderwritingDecision
from server.schemas.submission import SubmissionCreate
from server.services.scoring_engine import calculate_risk_score
from server.services.flagging_engine import generate_missing_info_flags
from server.services.audit_service import log_event


def generate_submission_number(db: Session) -> str:
    current_year = datetime.utcnow().year
    count = db.query(Submission).count() + 1
    return f"FAC-{current_year}-{count:04d}"


def create_submission(db: Session, payload: SubmissionCreate) -> Submission:
    sub_num = generate_submission_number(db)
    submission = Submission(
        submission_number=sub_num,
        carrier_name=payload.carrier_name,
        insured_name=payload.insured_name,
        risk_type=payload.risk_type,
        primary_limit=payload.primary_limit,
        attachment_point=payload.attachment_point,
        ceded_limit=payload.ceded_limit,
        carrier_premium=payload.carrier_premium,
        policy_start_date=payload.policy_start_date,
        policy_end_date=payload.policy_end_date,
        status="UNDER_REVIEW",
    )
    db.add(submission)
    db.flush()

    if payload.risk_type == "CYBER" and payload.cyber_profile:
        cyber_prof = CyberRiskProfile(
            submission_id=submission.id,
            industry_sector=payload.cyber_profile.industry_sector,
            record_count=payload.cyber_profile.record_count,
            has_mfa_email=payload.cyber_profile.has_mfa_email,
            has_mfa_remote_access=payload.cyber_profile.has_mfa_remote_access,
            has_mfa_admin_accounts=payload.cyber_profile.has_mfa_admin_accounts,
            has_edr_deployed=payload.cyber_profile.has_edr_deployed,
            has_immutable_backups=payload.cyber_profile.has_immutable_backups,
            prior_ransomware_claims=payload.cyber_profile.prior_ransomware_claims,
        )
        db.add(cyber_prof)
        db.flush()
        submission.cyber_profile = cyber_prof

    elif payload.risk_type == "DO" and payload.do_profile:
        do_prof = DoRiskProfile(
            submission_id=submission.id,
            company_structure=payload.do_profile.company_structure,
            market_cap=payload.do_profile.market_cap,
            debt_to_equity_ratio=payload.do_profile.debt_to_equity_ratio,
            executive_turnover_count=payload.do_profile.executive_turnover_count,
            has_board_oversight_charter=payload.do_profile.has_board_oversight_charter,
            pending_litigation_flag=payload.do_profile.pending_litigation_flag,
            prior_securities_claims=payload.do_profile.prior_securities_claims,
        )
        db.add(do_prof)
        db.flush()
        submission.do_profile = do_prof

    # Compute risk score
    score, tier, breakdown, is_calibrated = calculate_risk_score(submission)
    risk_score_obj = RiskScore(
        submission_id=submission.id,
        calculated_score=score,
        risk_tier=tier,
        scoring_breakdown=breakdown,
        is_calibrated=is_calibrated,
    )
    db.add(risk_score_obj)

    # Generate missing info flags
    flag_dicts = generate_missing_info_flags(submission)
    has_critical_flag = False
    for f in flag_dicts:
        if f["severity"] == "CRITICAL":
            has_critical_flag = True
        flag_obj = MissingInfoFlag(
            submission_id=submission.id,
            field_name=f["field_name"],
            flag_code=f["flag_code"],
            description=f["description"],
            severity=f["severity"],
            is_resolved=False,
        )
        db.add(flag_obj)

    if has_critical_flag:
        submission.status = "INFO_REQUESTED"
    else:
        submission.status = "UNDER_REVIEW"

    db.commit()
    db.refresh(submission)

    # Log audit events
    log_event(
        db,
        entity_type="SUBMISSION",
        entity_id=submission.id,
        action="CREATED",
        actor_id=payload.carrier_name,
        changes={"submission_number": sub_num, "risk_type": payload.risk_type},
    )
    log_event(
        db,
        entity_type="SCORING",
        entity_id=submission.id,
        action="SCORED",
        actor_id="scoring_engine",
        changes={"calculated_score": score, "risk_tier": tier},
    )

    return submission


def list_submissions(
    db: Session,
    risk_type: Optional[str] = None,
    status: Optional[str] = None,
    min_score: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[dict], int]:
    query = db.query(Submission)

    if risk_type:
        query = query.filter(Submission.risk_type == risk_type.upper())
    if status:
        query = query.filter(Submission.status == status.upper())

    total = query.count()
    submissions = (
        query.order_by(desc(Submission.created_at)).offset(skip).limit(limit).all()
    )

    items = []
    for sub in submissions:
        # Get latest score
        latest_score_obj = (
            db.query(RiskScore)
            .filter(RiskScore.submission_id == sub.id)
            .order_by(desc(RiskScore.created_at))
            .first()
        )
        score_val = latest_score_obj.calculated_score if latest_score_obj else None
        tier_val = latest_score_obj.risk_tier if latest_score_obj else None

        if min_score is not None:
            if score_val is None or score_val < min_score:
                continue

        flag_count = (
            db.query(MissingInfoFlag)
            .filter(
                MissingInfoFlag.submission_id == sub.id,
                MissingInfoFlag.is_resolved.is_(False),
            )
            .count()
        )

        items.append(
            {
                "id": sub.id,
                "submission_number": sub.submission_number,
                "carrier_name": sub.carrier_name,
                "insured_name": sub.insured_name,
                "risk_type": sub.risk_type,
                "primary_limit": sub.primary_limit,
                "attachment_point": sub.attachment_point,
                "ceded_limit": sub.ceded_limit,
                "carrier_premium": sub.carrier_premium,
                "policy_start_date": sub.policy_start_date,
                "policy_end_date": sub.policy_end_date,
                "status": sub.status,
                "calculated_score": score_val,
                "risk_tier": tier_val,
                "missing_flags_count": flag_count,
                "created_at": sub.created_at,
                "updated_at": sub.updated_at,
            }
        )

    return items, total


def get_submission_detail(db: Session, submission_id: str) -> Optional[dict]:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        return None

    latest_score_obj = (
        db.query(RiskScore)
        .filter(RiskScore.submission_id == submission.id)
        .order_by(desc(RiskScore.created_at))
        .first()
    )
    flags = (
        db.query(MissingInfoFlag)
        .filter(MissingInfoFlag.submission_id == submission.id)
        .all()
    )
    latest_decision = (
        db.query(UnderwritingDecision)
        .filter(UnderwritingDecision.submission_id == submission.id)
        .order_by(desc(UnderwritingDecision.created_at))
        .first()
    )

    decision_dict = None
    if latest_decision:
        decision_dict = {
            "id": latest_decision.id,
            "submission_id": latest_decision.submission_id,
            "underwriter_id": latest_decision.underwriter_id,
            "decision_type": latest_decision.decision_type,
            "offered_capacity": latest_decision.offered_capacity,
            "quoted_rate": latest_decision.quoted_rate,
            "quoted_premium": latest_decision.quoted_premium,
            "terms_conditions": latest_decision.terms_conditions,
            "exclusions": latest_decision.exclusions or [],
            "decline_reason_code": latest_decision.decline_reason_code,
            "decline_notes": latest_decision.decline_notes,
            "recorded_at": latest_decision.created_at,
        }

    score_dict = None
    if latest_score_obj:
        score_dict = {
            "id": latest_score_obj.id,
            "calculated_score": latest_score_obj.calculated_score,
            "risk_tier": latest_score_obj.risk_tier,
            "scoring_breakdown": latest_score_obj.scoring_breakdown,
            "is_calibrated": latest_score_obj.is_calibrated,
            "created_at": latest_score_obj.created_at,
        }

    return {
        "id": submission.id,
        "submission_number": submission.submission_number,
        "carrier_name": submission.carrier_name,
        "insured_name": submission.insured_name,
        "risk_type": submission.risk_type,
        "primary_limit": submission.primary_limit,
        "attachment_point": submission.attachment_point,
        "ceded_limit": submission.ceded_limit,
        "carrier_premium": submission.carrier_premium,
        "policy_start_date": submission.policy_start_date,
        "policy_end_date": submission.policy_end_date,
        "status": submission.status,
        "created_at": submission.created_at,
        "updated_at": submission.updated_at,
        "cyber_profile": submission.cyber_profile,
        "do_profile": submission.do_profile,
        "risk_score": score_dict,
        "flags": flags,
        "decision": decision_dict,
    }


def get_submission_flags(
    db: Session, submission_id: str
) -> Optional[List[MissingInfoFlag]]:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        return None
    return (
        db.query(MissingInfoFlag)
        .filter(MissingInfoFlag.submission_id == submission_id)
        .all()
    )

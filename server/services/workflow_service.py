from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models.submission import Submission
from server.models.user import User
from server.schemas.decision import (
    StatusTransitionRequest,
    ReferralDecisionRequest,
    FinalDecisionRequest,
)
from server.services.audit_service import log_submission_action
from server.config import settings

VALID_TRANSITIONS = {
    "RECEIVED": ["IN_REVIEW", "INFO_REQUESTED", "DECLINED"],
    "IN_REVIEW": ["INFO_REQUESTED", "REFERRED_TO_MANAGER", "QUOTED", "DECLINED"],
    "INFO_REQUESTED": ["IN_REVIEW", "DECLINED"],
    "REFERRED_TO_MANAGER": ["IN_REVIEW", "QUOTED", "DECLINED"],
    "QUOTED": ["BOUND", "DECLINED", "INFO_REQUESTED", "IN_REVIEW"],
    "BOUND": [],  # Terminal state
    "DECLINED": [],  # Terminal state
}


def transition_submission_status(
    db: Session,
    submission_id: str,
    req: StatusTransitionRequest,
    current_user: User,
) -> Submission:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    target = req.target_status.upper()
    current = submission.status.upper()

    if target == current:
        return submission

    allowed = VALID_TRANSITIONS.get(current, [])
    if target not in allowed and current_user.role != "UNDERWRITING_MANAGER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Illegal transition from '{current}' to '{target}'. Allowed transitions: {allowed}",
        )

    # Authority check: if attempting to Quote/Bound and policy limit > underwriter limit, must refer to manager
    if target in ["QUOTED", "BOUND"] and current_user.role != "UNDERWRITING_MANAGER":
        uw_limit = (
            current_user.authority_limit or settings.UNDERWRITER_DEFAULT_AUTHORITY_LIMIT
        )
        if (
            submission.policy_limit > uw_limit
            and submission.referral_status != "APPROVED"
        ):
            submission.status = "REFERRED_TO_MANAGER"
            submission.referral_status = "PENDING"
            submission.referral_notes = f"Limit of ${submission.policy_limit:,.2f} exceeds underwriter authority of ${uw_limit:,.2f}"
            db.flush()
            log_submission_action(
                db=db,
                submission_id=submission.id,
                action_type="REFERRAL_TRIGGERED",
                actor=current_user,
                previous_state={"status": current},
                new_state={
                    "status": "REFERRED_TO_MANAGER",
                    "referral_status": "PENDING",
                },
                change_reason=submission.referral_notes,
            )
            db.commit()
            db.refresh(submission)
            return submission

    prev_state = {"status": current}
    submission.status = target
    submission.updated_at = datetime.now(timezone.utc)
    if (
        target == "IN_REVIEW"
        and not submission.assigned_underwriter_id
        and current_user.role in ["RE_UNDERWRITER", "UNDERWRITING_MANAGER"]
    ):
        submission.assigned_underwriter_id = current_user.id

    db.flush()

    log_submission_action(
        db=db,
        submission_id=submission.id,
        action_type="STATUS_CHANGED",
        actor=current_user,
        previous_state=prev_state,
        new_state={"status": target},
        change_reason=req.notes or req.reason or f"Transitioned status to {target}",
    )

    db.commit()
    db.refresh(submission)
    return submission


def process_referral_decision(
    db: Session,
    submission_id: str,
    req: ReferralDecisionRequest,
    current_user: User,
) -> Submission:
    if current_user.role != "UNDERWRITING_MANAGER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Underwriting Managers can approve or reject referrals",
        )

    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    decision = req.decision.upper()
    if decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=400, detail="Referral decision must be APPROVED or REJECTED"
        )

    prev_status = submission.status
    submission.referral_status = decision
    submission.referral_manager_id = current_user.id
    submission.referral_decided_at = datetime.now(timezone.utc)
    submission.referral_notes = req.notes or f"Manager referral {decision.lower()}"

    if decision == "APPROVED":
        submission.status = "IN_REVIEW"
    else:
        submission.status = "DECLINED"
        submission.decline_reason_code = "REFERRAL_REJECTED"
        submission.decline_notes = (
            req.notes or "Underwriting Manager rejected high-limit referral"
        )

    db.flush()

    log_submission_action(
        db=db,
        submission_id=submission.id,
        action_type="REFERRAL_DECIDED",
        actor=current_user,
        previous_state={"status": prev_status, "referral_status": "PENDING"},
        new_state={"status": submission.status, "referral_status": decision},
        change_reason=submission.referral_notes,
    )

    db.commit()
    db.refresh(submission)
    return submission


def make_final_decision(
    db: Session,
    submission_id: str,
    req: FinalDecisionRequest,
    current_user: User,
) -> Submission:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    decision = req.decision.upper()
    if decision not in ["BOUND", "DECLINED"]:
        raise HTTPException(
            status_code=400, detail="Final decision must be BOUND or DECLINED"
        )

    if decision == "DECLINED":
        if not req.decline_reason_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Decline reason code is mandatory when declining a submission",
            )
        submission.status = "DECLINED"
        submission.decline_reason_code = req.decline_reason_code
        submission.decline_notes = (
            req.notes or f"Declined with reason: {req.decline_reason_code}"
        )
    else:  # BOUND
        # Check authority limit if not manager
        if current_user.role != "UNDERWRITING_MANAGER":
            uw_limit = (
                current_user.authority_limit
                or settings.UNDERWRITER_DEFAULT_AUTHORITY_LIMIT
            )
            if (
                submission.policy_limit > uw_limit
                and submission.referral_status != "APPROVED"
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Requested limit of ${submission.policy_limit:,.2f} exceeds your authority limit of ${uw_limit:,.2f}. Manager referral approval required.",
                )
        submission.status = "BOUND"

    submission.updated_at = datetime.now(timezone.utc)
    db.flush()

    log_submission_action(
        db=db,
        submission_id=submission.id,
        action_type=decision,
        actor=current_user,
        new_state={
            "status": decision,
            "decline_reason_code": submission.decline_reason_code,
            "decline_notes": submission.decline_notes,
        },
        change_reason=req.notes or f"Final decision: {decision}",
    )

    db.commit()
    db.refresh(submission)
    return submission

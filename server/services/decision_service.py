import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from server.models import (
    ReinsuranceSubmission,
    UnderwritingDecision,
    SubmissionMissingFlag,
)
from server.schemas import (
    UnderwritingDecisionCreate,
    UnderwritingDecisionResponse,
    DecisionType,
)


class DecisionService:
    @staticmethod
    def record_decision(
        db: Session, payload: UnderwritingDecisionCreate
    ) -> UnderwritingDecisionResponse:
        submission = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.id == payload.submission_id)
            .first()
        )
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reinsurance submission with id '{payload.submission_id}' not found.",
            )

        # Invariant enforcement: Submissions with unresolved blocking flags cannot be QUOTED
        if payload.decision == DecisionType.QUOTE:
            unresolved_blocking_flags = (
                db.query(SubmissionMissingFlag)
                .filter(
                    SubmissionMissingFlag.submission_id == payload.submission_id,
                    SubmissionMissingFlag.is_blocking == True,
                    SubmissionMissingFlag.is_resolved == False,
                )
                .all()
            )
            if unresolved_blocking_flags:
                flag_msgs = "; ".join(
                    [f.flag_message for f in unresolved_blocking_flags]
                )
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Cannot quote submission with unresolved blocking missing information flags: {flag_msgs}",
                )

            submission.status = "QUOTED"
        elif payload.decision == DecisionType.DECLINE:
            submission.status = "DECLINED"

        decision_id = str(uuid.uuid4())
        decision_entity = UnderwritingDecision(
            id=decision_id,
            submission_id=submission.id,
            underwriter_id=payload.underwriter_id,
            decision=payload.decision.value,
            quoted_premium_usd=payload.quoted_premium_usd,
            quoted_limit_usd=payload.quoted_limit_usd,
            quoted_attachment_usd=payload.quoted_attachment_usd,
            decline_reason_code=payload.decline_reason_code,
            notes=payload.notes,
        )

        db.add(decision_entity)
        db.commit()
        db.refresh(submission)
        db.refresh(decision_entity)

        return UnderwritingDecisionResponse(
            decision_id=decision_entity.id,
            submission_id=submission.id,
            status=submission.status,
            decision=decision_entity.decision,
            underwriter_id=decision_entity.underwriter_id,
            quoted_premium_usd=decision_entity.quoted_premium_usd,
            quoted_limit_usd=decision_entity.quoted_limit_usd,
            quoted_attachment_usd=decision_entity.quoted_attachment_usd,
            decline_reason_code=decision_entity.decline_reason_code,
            notes=decision_entity.notes,
            recorded_at=decision_entity.recorded_at,
        )

    @staticmethod
    def resolve_flag(
        db: Session, flag_id: str, underwriter_id: str
    ) -> SubmissionMissingFlag:
        flag = (
            db.query(SubmissionMissingFlag)
            .filter(SubmissionMissingFlag.id == flag_id)
            .first()
        )
        if not flag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Missing information flag with id '{flag_id}' not found.",
            )

        flag.is_resolved = True
        flag.resolved_by = underwriter_id
        flag.resolved_at = datetime.now(timezone.utc)

        # Check if other unresolved flags remain on submission
        submission = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.id == flag.submission_id)
            .first()
        )
        if submission:
            remaining_unresolved = (
                db.query(SubmissionMissingFlag)
                .filter(
                    SubmissionMissingFlag.submission_id == submission.id,
                    SubmissionMissingFlag.is_resolved == False,
                )
                .count()
            )
            submission.has_missing_info = remaining_unresolved > 0

        db.commit()
        db.refresh(flag)
        return flag

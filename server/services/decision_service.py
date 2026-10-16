import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from server.models.submission import Submission
from server.models.decision import DecisionRecord
from server.schemas.decision import DecisionCreate


def record_underwriting_decision(db: Session, decision_in: DecisionCreate) -> DecisionRecord:
    submission = db.query(Submission).filter(Submission.id == decision_in.submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=404,
            detail=f"Submission with ID {decision_in.submission_id} does not exist",
        )

    # Validate decision specific fields
    if decision_in.decision_type == "QUOTE":
        if decision_in.quoted_premium is None or decision_in.quoted_premium <= 0:
            raise HTTPException(
                status_code=400,
                detail="quoted_premium must be provided and greater than 0 for QUOTE decision",
            )
        if decision_in.quoted_limit is None or decision_in.quoted_limit <= 0:
            raise HTTPException(
                status_code=400,
                detail="quoted_limit must be provided and greater than 0 for QUOTE decision",
            )
        if decision_in.quoted_attachment_point is None or decision_in.quoted_attachment_point < 0:
            raise HTTPException(
                status_code=400,
                detail="quoted_attachment_point must be provided and >= 0 for QUOTE decision",
            )
        submission.status = "QUOTED"

    elif decision_in.decision_type == "DECLINE":
        if not decision_in.decline_reason_code:
            raise HTTPException(
                status_code=400,
                detail="decline_reason_code is required for DECLINE decision",
            )
        submission.status = "DECLINED"

    elif decision_in.decision_type == "REQUEST_INFO":
        submission.status = "INFO_REQUESTED"

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported decision type: {decision_in.decision_type}",
        )

    decision_id = str(uuid.uuid4())
    decision_record = DecisionRecord(
        id=decision_id,
        submission_id=submission.id,
        decision_type=decision_in.decision_type,
        underwriter_id=decision_in.underwriter_id,
        underwriter_name=decision_in.underwriter_name,
        quoted_premium=decision_in.quoted_premium,
        quoted_limit=decision_in.quoted_limit,
        quoted_attachment_point=decision_in.quoted_attachment_point,
        subjectivities=decision_in.subjectivities,
        decline_reason_code=decision_in.decline_reason_code,
        decline_notes=decision_in.decline_notes,
    )
    db.add(decision_record)
    submission.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(decision_record)
    return decision_record


def get_decisions_by_submission(db: Session, submission_id: str) -> List[DecisionRecord]:
    return (
        db.query(DecisionRecord)
        .filter(DecisionRecord.submission_id == submission_id)
        .order_by(DecisionRecord.decided_at.desc())
        .all()
    )

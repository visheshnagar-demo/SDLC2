import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from server.models import AuditLog
from server.schemas import AuditLogResponseSchema


def record_audit_log(
    db: Session,
    submission_id: str,
    action_type: str,
    user_id: str,
    user_role: str | None = None,
    change_summary: str | None = None,
    previous_state: str | None = None,
    new_state: str | None = None,
) -> AuditLog:
    log = AuditLog(
        id=str(uuid.uuid4()),
        submission_id=submission_id,
        action_type=action_type,
        user_id=user_id or "system",
        user_role=user_role or "SYSTEM",
        change_summary=change_summary,
        previous_state=previous_state,
        new_state=new_state,
        timestamp=datetime.now(UTC),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_audit_trail_for_submission(
    db: Session, submission_id: str
) -> list[AuditLogResponseSchema]:
    logs = (
        db.query(AuditLog)
        .filter_by(submission_id=submission_id)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )
    return [
        AuditLogResponseSchema(
            id=log.id,
            submissionId=log.submission_id,
            actionType=log.action_type,
            userId=log.user_id,
            userRole=log.user_role,
            changeSummary=log.change_summary,
            previousState=log.previous_state,
            newState=log.new_state,
            timestamp=log.timestamp,
        )
        for log in logs
    ]

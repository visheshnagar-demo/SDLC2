import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from server.models.audit_log import SubmissionAuditLog
from server.models.user import User


def log_submission_action(
    db: Session,
    submission_id: str,
    action_type: str,
    actor: Optional[User] = None,
    previous_state: Optional[Dict[str, Any]] = None,
    new_state: Optional[Dict[str, Any]] = None,
    change_reason: Optional[str] = None,
) -> SubmissionAuditLog:
    log_entry = SubmissionAuditLog(
        id=str(uuid.uuid4()),
        submission_id=submission_id,
        actor_user_id=actor.id if actor else None,
        actor_email=actor.email if actor else "system@reinsurance.local",
        actor_role=actor.role if actor else "SYSTEM",
        action_type=action_type,
        previous_state=previous_state,
        new_state=new_state,
        change_reason=change_reason,
        created_at=datetime.now(timezone.utc),
    )
    db.add(log_entry)
    db.flush()
    return log_entry

import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from server.models.audit_log import AuditLog


def log_audit(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_id: Optional[str] = None,
    actor_name: Optional[str] = None,
    details: Optional[str] = None,
) -> AuditLog:
    """
    Creates an AuditLog record and adds it to the session.
    Route handlers own the commit to maintain transaction atomicity.
    """
    log_entry = AuditLog(
        id=str(uuid.uuid4()),
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        actor_name=actor_name,
        action=action,
        details=details,
        created_at=datetime.now(timezone.utc),
    )
    db.add(log_entry)
    return log_entry

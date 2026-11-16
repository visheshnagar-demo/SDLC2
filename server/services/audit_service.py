import json
import uuid
from typing import Any, Optional
from sqlalchemy.orm import Session
from server.models.audit_log import AuditLog


def log_action(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_id: Optional[str] = None,
    details: Optional[Any] = None,
) -> AuditLog:
    details_str = (
        json.dumps(details) if isinstance(details, (dict, list)) else str(details or "")
    )
    audit = AuditLog(
        id=str(uuid.uuid4()),
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        actor_id=actor_id,
        details=details_str,
    )
    db.add(audit)
    try:
        db.commit()
    except Exception:
        db.rollback()
    return audit

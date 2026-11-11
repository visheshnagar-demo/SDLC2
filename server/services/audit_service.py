from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from server.models.evaluation import AuditLog


def log_event(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_id: str = "system",
    changes: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    audit_entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        actor_id=actor_id,
        changes=changes or {},
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry

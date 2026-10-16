import json
import uuid
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from server.models.audit_log import AuditLog


class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        entity_type: str,
        entity_id: str,
        action: str,
        actor_user_id: str,
        actor_role: str,
        state_diff: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        state_diff_str = json.dumps(state_diff) if state_diff else None
        audit = AuditLog(
            id=str(uuid.uuid4()),
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            state_diff_json=state_diff_str,
        )
        db.add(audit)
        try:
            db.commit()
            db.refresh(audit)
        except Exception:
            db.rollback()
        return audit

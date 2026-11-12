import uuid
from sqlalchemy.orm import Session
from server.models.evaluation import AuditLog


class AuditService:
    @staticmethod
    def log_action(
        db: Session, submission_id: str, action: str, details: str
    ) -> AuditLog:
        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            submission_id=submission_id,
            action=action,
            details=details,
        )
        db.add(audit_entry)
        return audit_entry

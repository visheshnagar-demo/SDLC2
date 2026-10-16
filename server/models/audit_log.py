import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(
        String(50), nullable=False
    )  # submission, decision, attachment, lock
    entity_id = Column(String(36), nullable=False, index=True)
    action = Column(
        String(50), nullable=False
    )  # CREATE, SUBMIT, SCORE_CALCULATED, LOCK_ACQUIRED, LOCK_RELEASED, DECISION_RECORDED
    actor_user_id = Column(String(36), nullable=False)
    actor_role = Column(String(50), nullable=False)
    state_diff_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False)

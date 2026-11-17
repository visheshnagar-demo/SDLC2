import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from server.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(64), nullable=False, index=True)
    entity_id = Column(String(36), nullable=False, index=True)
    actor_id = Column(String(36), nullable=True)
    actor_name = Column(String(255), nullable=True)
    action = Column(String(128), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

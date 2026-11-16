import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from server.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    actor_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

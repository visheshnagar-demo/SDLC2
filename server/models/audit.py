import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from server.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    resource = Column(String(100), nullable=False)
    resource_id = Column(String(36), nullable=True)
    details_json = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=False, default="127.0.0.1")
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

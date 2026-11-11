import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from server.database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    calculated_score = Column(Float, nullable=False)
    risk_tier = Column(String(32), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    scoring_breakdown = Column(JSON, nullable=False, default=dict)
    is_calibrated = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="risk_scores")


class MissingInfoFlag(Base):
    __tablename__ = "missing_info_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    field_name = Column(String(128), nullable=False)
    flag_code = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), nullable=False)  # CRITICAL, WARNING, INFO
    is_resolved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="flags")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submissions.id"), nullable=False)
    underwriter_id = Column(String(128), nullable=False, default="underwriter_system")
    decision_type = Column(String(32), nullable=False)  # QUOTE, DECLINE
    offered_capacity = Column(Float, nullable=True)
    quoted_rate = Column(Float, nullable=True)
    quoted_premium = Column(Float, nullable=True)
    terms_conditions = Column(Text, nullable=True)
    exclusions = Column(JSON, nullable=True, default=list)
    decline_reason_code = Column(String(64), nullable=True)
    decline_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="decisions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)
    actor_id = Column(String(128), nullable=False, default="system")
    changes = Column(JSON, nullable=True, default=dict)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)

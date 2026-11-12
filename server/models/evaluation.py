import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    overall_score = Column(Float, nullable=False)
    risk_tier = Column(String(50), nullable=False)  # LOW, MEDIUM, HIGH
    breakdown_json = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=_utcnow, nullable=False)

    submission = relationship("Submission", back_populates="risk_score_detail")


class MissingInfoFlag(Base):
    __tablename__ = "missing_info_flags"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    field_name = Column(String(100), nullable=False)
    flag_code = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    severity = Column(String(50), default="MEDIUM", nullable=False)  # HIGH, MEDIUM, LOW
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)

    submission = relationship("Submission", back_populates="flags")

    @property
    def flag_name(self) -> str:
        return self.description

    @property
    def code(self) -> str:
        return self.flag_code

    @property
    def field(self) -> str:
        return self.field_name

    @property
    def message(self) -> str:
        return self.description

    @property
    def title(self) -> str:
        return self.description

    @property
    def resolved(self) -> bool:
        return self.is_resolved


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    decision_type = Column(String(50), nullable=False)  # QUOTE | DECLINE
    offered_capacity = Column(Float, nullable=True)
    quoted_rate = Column(Float, nullable=True)
    quoted_premium = Column(Float, nullable=True)
    terms_conditions = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    decline_reason_code = Column(String(100), nullable=True)
    decline_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow, nullable=False)

    submission = relationship("Submission", back_populates="decisions")

    @property
    def decision(self) -> str:
        return self.decision_type

    @property
    def capacity(self) -> Optional[float]:
        return self.offered_capacity

    @property
    def rate(self) -> Optional[float]:
        return self.quoted_rate

    @property
    def premium(self) -> Optional[float]:
        return self.quoted_premium

    @property
    def reason(self) -> Optional[str]:
        return self.decline_reason_code

    @property
    def reason_code(self) -> Optional[str]:
        return self.decline_reason_code


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)

    submission = relationship("Submission", back_populates="audit_logs")

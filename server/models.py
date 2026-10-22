import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from server.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ceding_company_name = Column(String(255), nullable=False)
    insured_name = Column(String(255), nullable=False)
    line_of_business = Column(String(100), nullable=False)
    policy_limit = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    retention = Column(Float, nullable=False, default=0.0)
    gross_premium = Column(Float, nullable=False)
    effective_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    industry = Column(String(100), nullable=False)
    revenue_band = Column(String(100), nullable=False)
    jurisdiction = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="RECEIVED")
    risk_score = Column(Integer, nullable=True)
    risk_tier = Column(String(50), nullable=True)
    is_referred = Column(Boolean, default=False)
    assigned_underwriter_id = Column(String(36), nullable=True)
    created_by = Column(String(255), nullable=False, default="cedant@example.com")
    risk_attributes_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    documents = relationship(
        "SubmissionDocument", back_populates="submission", cascade="all, delete-orphan"
    )
    factor_breakdowns = relationship(
        "RiskFactorBreakdown", back_populates="submission", cascade="all, delete-orphan"
    )
    quotes = relationship(
        "Quote", back_populates="submission", cascade="all, delete-orphan"
    )
    decisions = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    audit_logs = relationship(
        "AuditLog", back_populates="submission", cascade="all, delete-orphan"
    )


class SubmissionDocument(Base):
    __tablename__ = "submission_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    document_type = Column(String(100), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_url = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    submission = relationship("Submission", back_populates="documents")


class RiskFactorBreakdown(Base):
    __tablename__ = "risk_factor_breakdowns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    factor_category = Column(String(100), nullable=False)
    factor_name = Column(String(255), nullable=False)
    score_awarded = Column(Integer, nullable=False)
    max_score = Column(Integer, nullable=False)
    evaluation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    submission = relationship("Submission", back_populates="factor_breakdowns")


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    share_offered_percentage = Column(Float, nullable=False)
    ceding_commission_percentage = Column(Float, nullable=False)
    calculated_reinsurance_premium = Column(Float, nullable=False)
    net_reinsurance_premium = Column(Float, nullable=False)
    ceding_commission_amount = Column(Float, nullable=False)
    subjectivities = Column(Text, nullable=True)
    conditions = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="ISSUED")
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    submission = relationship("Submission", back_populates="quotes")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    decline_reason = Column(String(255), nullable=True)
    underwriter_notes = Column(Text, nullable=True)
    decided_by = Column(String(255), nullable=True)
    user_role = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    submission = relationship("Submission", back_populates="decisions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    action_type = Column(String(100), nullable=False)
    user_id = Column(String(255), nullable=False)
    user_role = Column(String(50), nullable=True)
    change_summary = Column(Text, nullable=True)
    previous_state = Column(Text, nullable=True)
    new_state = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    submission = relationship("Submission", back_populates="audit_logs")


class UnderwritingAuthority(Base):
    __tablename__ = "underwriting_authorities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role_name = Column(String(50), unique=True, nullable=False)
    max_policy_limit = Column(Float, nullable=False)


class ScoringRule(Base):
    __tablename__ = "scoring_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    line_of_business = Column(String(100), nullable=False)
    rule_name = Column(String(100), nullable=False)
    weight = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)

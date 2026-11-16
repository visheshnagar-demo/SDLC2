import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def get_utc_now():
    return datetime.now(timezone.utc)


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String, primary_key=True, default=generate_uuid)
    tracking_number = Column(String, unique=True, index=True, nullable=False)
    risk_type = Column(String, nullable=False)  # CYBER, D_AND_O
    insured_name = Column(String, nullable=False)
    industry_sector = Column(String, nullable=False)
    annual_revenue = Column(Float, nullable=False)
    primary_policy_limit = Column(Float, nullable=False)
    requested_reinsurance_limit = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    policy_effective_date = Column(String, nullable=False)
    policy_expiration_date = Column(String, nullable=False)
    status = Column(
        String, default="SUBMITTED", nullable=False
    )  # SUBMITTED, UNDER_REVIEW, FLAGGED, QUOTED, DECLINED
    overall_risk_score = Column(Float, default=0.0)
    risk_tier = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    missing_flags_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    risk_profile = relationship(
        "RiskProfile",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )
    documents = relationship(
        "SubmissionDocument", back_populates="submission", cascade="all, delete-orphan"
    )
    risk_scores = relationship(
        "RiskScore", back_populates="submission", cascade="all, delete-orphan"
    )
    missing_flags = relationship(
        "MissingInformationFlag",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    decisions = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    audit_logs = relationship(
        "AuditLog", back_populates="submission", cascade="all, delete-orphan"
    )


class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(
        String,
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    claims_count_3yr = Column(Integer, default=0)
    total_losses_3yr = Column(Float, default=0.0)
    security_framework = Column(String, nullable=True)
    mfa_enforced = Column(Boolean, default=False)
    backup_immutable = Column(Boolean, default=False)
    board_governance_score = Column(Float, default=0.0)
    regulatory_enforcement_action = Column(Boolean, default=False)
    esg_risk_rating = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    submission = relationship("ReinsuranceSubmission", back_populates="risk_profile")


class SubmissionDocument(Base):
    __tablename__ = "submission_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(
        String,
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    document_type = Column(
        String, nullable=False
    )  # LOSS_RUNS, FINANCIAL_STATEMENTS, SECURITY_AUDIT, POLICY_WORDING
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    file_url = Column(String, nullable=True)
    status = Column(String, default="VERIFIED")
    created_at = Column(DateTime, default=get_utc_now)

    submission = relationship("ReinsuranceSubmission", back_populates="documents")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(
        String,
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    composite_score = Column(Float, nullable=False, default=0.0)
    completeness_score = Column(Float, nullable=False, default=0.0)
    exposure_score = Column(Float, nullable=False, default=0.0)
    loss_history_score = Column(Float, nullable=False, default=0.0)
    governance_score = Column(Float, nullable=False, default=0.0)
    risk_tier = Column(String, nullable=False, default="MEDIUM")
    benchmark_delta = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    submission = relationship("ReinsuranceSubmission", back_populates="risk_scores")


class MissingInformationFlag(Base):
    __tablename__ = "missing_information_flags"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(
        String,
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    field_or_document_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    severity = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)
    resolved_at = Column(DateTime, nullable=True)

    submission = relationship("ReinsuranceSubmission", back_populates="missing_flags")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(
        String,
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    decision_type = Column(String, nullable=False)  # QUOTE, DECLINE
    quoted_capacity = Column(Float, nullable=True)
    premium_rate_pct = Column(Float, nullable=True)
    quoted_premium = Column(Float, nullable=True)
    quote_validity_days = Column(Integer, nullable=True)
    decline_reason_code = Column(String, nullable=True)
    underwriter_notes = Column(Text, nullable=True)
    decided_by = Column(String, default="underwriter@reinsurance.com")
    created_at = Column(DateTime, default=get_utc_now)

    submission = relationship("ReinsuranceSubmission", back_populates="decisions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(
        String,
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    actor_id = Column(String, nullable=False, default="system")
    actor_role = Column(String, nullable=False, default="System")
    action = Column(String, nullable=False)
    state_before = Column(String, nullable=True)
    state_after = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)

    submission = relationship("ReinsuranceSubmission", back_populates="audit_logs")

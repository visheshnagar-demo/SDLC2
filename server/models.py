import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    Date,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    organization_name = Column(String(255), nullable=True)
    role = Column(
        String(50), nullable=False, default="CARRIER_REP"
    )  # CARRIER_REP, UNDERWRITER, ADMIN
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    submissions = relationship(
        "ReinsuranceSubmission", back_populates="carrier", cascade="all, delete-orphan"
    )
    decisions = relationship("UnderwritingDecision", back_populates="underwriter")


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_number = Column(String(32), unique=True, index=True, nullable=False)
    carrier_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    risk_type = Column(String(20), nullable=False, index=True)  # CYBER, D_AND_O
    insured_name = Column(String(255), nullable=False, index=True)
    industry_sector = Column(String(100), nullable=False)
    annual_revenue = Column(Float, nullable=False)
    primary_policy_limit = Column(Float, nullable=False)
    requested_reinsurance_limit = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    policy_effective_date = Column(Date, nullable=False)
    policy_expiration_date = Column(Date, nullable=False)
    status = Column(
        String(30), nullable=False, default="SUBMITTED", index=True
    )  # SUBMITTED, IN_REVIEW, FLAGGED, QUOTED, DECLINED
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    carrier = relationship("User", back_populates="submissions")
    risk_profile = relationship(
        "RiskProfile",
        uselist=False,
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    documents = relationship(
        "SubmissionDocument", back_populates="submission", cascade="all, delete-orphan"
    )
    risk_score = relationship(
        "RiskScore",
        uselist=False,
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    missing_flags = relationship(
        "MissingInformationFlag",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    decision = relationship(
        "UnderwritingDecision",
        uselist=False,
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    audit_logs = relationship(
        "AuditLog", back_populates="submission", cascade="all, delete-orphan"
    )


class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    profile_data = Column(JSON, nullable=True)
    prior_losses_count = Column(Integer, default=0, nullable=False)
    total_loss_amount = Column(Float, default=0.0, nullable=False)
    security_framework = Column(String(100), nullable=True)
    mfa_enforced = Column(Boolean, default=False, nullable=True)
    has_offline_backups = Column(Boolean, default=False, nullable=True)
    has_pending_claims = Column(Boolean, default=False, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="risk_profile")


class SubmissionDocument(Base):
    __tablename__ = "submission_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_type = Column(
        String(50), nullable=False
    )  # PRIMARY_POLICY_SCHEDULE, LOSS_RUN_REPORT, FINANCIAL_STATEMENT, etc.
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    file_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    uploaded_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="documents")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    overall_score = Column(Float, nullable=False)
    completeness_score = Column(Float, nullable=False)
    exposure_score = Column(Float, nullable=False, default=0.0)
    loss_score = Column(Float, nullable=False, default=0.0)
    governance_score = Column(Float, nullable=False, default=0.0)
    risk_tier = Column(
        String(30), nullable=False
    )  # PREFERRED, MODERATE_RISK, HIGH_RISK, SCRUTINY_REQUIRED
    scoring_breakdown = Column(JSON, nullable=True)
    scored_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="risk_score")


class MissingInformationFlag(Base):
    __tablename__ = "missing_information_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    field_name = Column(String(100), nullable=False)
    flag_severity = Column(String(20), nullable=False)  # HIGH, MEDIUM, LOW
    description = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="missing_flags")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    underwriter_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    decision_type = Column(String(20), nullable=False)  # QUOTE, DECLINE
    quoted_capacity = Column(Float, nullable=True)
    premium_rate_pct = Column(Float, nullable=True)
    quoted_premium = Column(Float, nullable=True)
    quote_validity_days = Column(Integer, nullable=True)
    decline_reason_code = Column(String(50), nullable=True)
    underwriter_notes = Column(Text, nullable=True)
    decided_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="decision")
    underwriter = relationship("User", back_populates="decisions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    actor_id = Column(String(36), nullable=True)
    actor_role = Column(
        String(50), nullable=False, default="SYSTEM"
    )  # CARRIER_REP, UNDERWRITER, SYSTEM
    action = Column(String(100), nullable=False)
    state_before = Column(JSON, nullable=True)
    state_after = Column(JSON, nullable=True)
    timestamp = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="audit_logs")

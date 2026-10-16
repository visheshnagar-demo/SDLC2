import uuid
from sqlalchemy import (
    Column,
    String,
    Float,
    Date,
    DateTime,
    Boolean,
    BigInteger,
    Text,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship
from server.database import Base


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_reference = Column(String(64), unique=True, nullable=False, index=True)
    carrier_name = Column(String(255), nullable=False)
    carrier_rating = Column(String(16), nullable=False)
    risk_category = Column(String(32), nullable=False)  # 'CYBER', 'DO'
    insured_entity_name = Column(String(255), nullable=False)
    industry_sector = Column(String(128), nullable=False)
    policy_limit_usd = Column(Float, nullable=False)
    attachment_point_usd = Column(Float, nullable=False)
    effective_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=False)
    primary_policy_number = Column(String(128), nullable=False)
    prior_loss_amount_usd = Column(Float, default=0.0, nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    priority = Column(
        String(16), default="MEDIUM", nullable=False
    )  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status = Column(
        String(32), default="SUBMITTED", nullable=False
    )  # 'SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'DECLINED'
    has_missing_info = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    documents = relationship(
        "SubmissionDocument", back_populates="submission", cascade="all, delete-orphan"
    )
    missing_flags = relationship(
        "SubmissionMissingFlag",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    decisions = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        cascade="all, delete-orphan",
    )


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
        String(64), nullable=False
    )  # 'CYBER_QUESTIONNAIRE', 'AUDITED_FINANCIALS', 'PRIMARY_POLICY', etc.
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    storage_uri = Column(String(1024), nullable=False)
    uploaded_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="documents")


class SubmissionMissingFlag(Base):
    __tablename__ = "submission_missing_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    field_name = Column(String(128), nullable=False)
    flag_message = Column(String(512), nullable=False)
    is_blocking = Column(Boolean, default=True, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    resolved_by = Column(String(128), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="missing_flags")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    underwriter_id = Column(String(128), nullable=False)
    decision = Column(String(32), nullable=False)  # 'QUOTE', 'DECLINE'
    quoted_premium_usd = Column(Float, nullable=True)
    quoted_limit_usd = Column(Float, nullable=True)
    quoted_attachment_usd = Column(Float, nullable=True)
    decline_reason_code = Column(
        String(64), nullable=True
    )  # 'EXCEEDS_RISK_APPETITE', 'INSUFFICIENT_DATA', etc.
    notes = Column(Text, nullable=True)
    recorded_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    submission = relationship("ReinsuranceSubmission", back_populates="decisions")

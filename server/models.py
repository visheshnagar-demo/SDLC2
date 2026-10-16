import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship

from server.database import Base


class CarrierProfile(Base):
    __tablename__ = "carrier_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    carrier_name = Column(String(255), nullable=False, unique=True, index=True)
    am_best_rating = Column(String(50), nullable=False, default="A")
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    submissions = relationship(
        "ReinsuranceSubmission", back_populates="carrier", cascade="all, delete-orphan"
    )


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    carrier_id = Column(
        String(36), ForeignKey("carrier_profiles.id"), nullable=False, index=True
    )
    risk_type = Column(String(50), nullable=False, index=True)  # CYBER, D_AND_O
    insured_name = Column(String(255), nullable=False, index=True)
    industry_sector = Column(String(255), nullable=False, default="General Commercial")
    annual_revenue = Column(Float, nullable=True, default=0.0)
    employee_count = Column(Integer, nullable=True, default=0)

    limit_requested = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    retention = Column(Float, nullable=False)

    effective_date = Column(String(50), nullable=False)
    expiry_date = Column(String(50), nullable=False)

    prior_loss_count = Column(Integer, nullable=False, default=0)
    prior_loss_total = Column(Float, nullable=False, default=0.0)

    risk_attributes = Column(JSON, nullable=True, default=dict)

    risk_score = Column(Integer, nullable=False, default=50)
    risk_tier = Column(
        String(50), nullable=False, default="MEDIUM"
    )  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(
        String(50), nullable=False, default="SUBMITTED", index=True
    )  # SUBMITTED, UNDER_REVIEW, INFORMATION_REQUESTED, QUOTED, DECLINED
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    carrier = relationship("CarrierProfile", back_populates="submissions")
    documents = relationship(
        "SubmissionDocument", back_populates="submission", cascade="all, delete-orphan"
    )
    missing_flags = relationship(
        "MissingInfoFlag", back_populates="submission", cascade="all, delete-orphan"
    )
    decision = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )


class SubmissionDocument(Base):
    __tablename__ = "submission_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False, index=True
    )
    document_type = Column(
        String(100), nullable=False
    )  # LOSS_RUN, SECURITY_AUDIT, FINANCIAL_STATEMENT, etc.
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    upload_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="documents")


class MissingInfoFlag(Base):
    __tablename__ = "missing_info_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False, index=True
    )
    flag_type = Column(String(50), nullable=False)  # FIELD, DOCUMENT
    field_or_doc_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="missing_flags")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id"),
        unique=True,
        nullable=False,
        index=True,
    )
    decision_type = Column(String(50), nullable=False)  # QUOTE, DECLINE

    premium_amount = Column(Float, nullable=True)
    capacity_offered = Column(Float, nullable=True)
    deductible_retention = Column(Float, nullable=True)
    subjectivities = Column(Text, nullable=True)
    validity_period_days = Column(Integer, nullable=True, default=30)

    decline_reason_code = Column(String(100), nullable=True)
    underwriter_id = Column(String(100), nullable=False, default="UW-SYSTEM")
    notes = Column(Text, nullable=True)
    decision_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="decision")

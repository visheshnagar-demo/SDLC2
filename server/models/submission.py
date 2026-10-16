import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_reference = Column(String(50), unique=True, nullable=False, index=True)
    carrier_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    risk_type = Column(String(20), nullable=False)  # CYBER, D_AND_O
    insured_name = Column(String(255), nullable=False)
    industry_segment = Column(String(100), nullable=False)
    annual_revenue = Column(Float, nullable=False)
    sum_insured = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    policy_start_date = Column(Date, nullable=False)
    policy_end_date = Column(Date, nullable=False)
    prior_claims_count = Column(Integer, default=0, nullable=False)
    prior_claims_total = Column(Float, default=0.0, nullable=False)
    security_governance_score = Column(Float, nullable=True)
    status = Column(
        String(30), nullable=False, default="DRAFT"
    )  # DRAFT, SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED
    risk_score = Column(Integer, nullable=True)
    risk_tier = Column(String(20), nullable=True)  # LOW, MEDIUM, HIGH
    active_lock_user_id = Column(String(36), nullable=True)
    locked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    carrier = relationship("User", back_populates="submissions")
    attachments = relationship(
        "SubmissionAttachment",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    missing_flags = relationship(
        "MissingInformationFlag",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    risk_score_breakdowns = relationship(
        "RiskScoreBreakdown", back_populates="submission", cascade="all, delete-orphan"
    )
    decision = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )

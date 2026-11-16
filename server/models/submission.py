import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_reference = Column(String(50), unique=True, index=True, nullable=False)
    carrier_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    risk_type = Column(String(50), nullable=False)  # CYBER, D_AND_O
    insured_name = Column(String(255), nullable=False)
    industry_segment = Column(String(100), nullable=False)
    annual_revenue = Column(Float, nullable=False, default=0.0)
    sum_insured = Column(Float, nullable=False, default=0.0)
    attachment_point = Column(Float, nullable=False, default=0.0)
    policy_start_date = Column(String(50), nullable=False)
    policy_end_date = Column(String(50), nullable=False)
    prior_claims_count = Column(Integer, nullable=False, default=0)
    prior_claims_total = Column(Float, nullable=False, default=0.0)
    security_governance_score = Column(Float, nullable=True)
    status = Column(
        String(50), nullable=False, default="SUBMITTED"
    )  # DRAFT, SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED
    risk_score = Column(Float, nullable=False, default=0.0)
    risk_tier = Column(String(50), nullable=False, default="LOW")  # LOW, MEDIUM, HIGH
    active_lock_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    lock_expires_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    carrier = relationship("User", foreign_keys=[carrier_id])
    locked_by = relationship("User", foreign_keys=[active_lock_user_id])
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
    score_breakdowns = relationship(
        "RiskScoreBreakdown", back_populates="submission", cascade="all, delete-orphan"
    )
    decisions = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        cascade="all, delete-orphan",
    )

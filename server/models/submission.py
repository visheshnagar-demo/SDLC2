import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class ReinsuranceSubmission(Base):
    __tablename__ = "reinsurance_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_reference = Column(String(64), unique=True, index=True, nullable=False)
    carrier_id = Column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    carrier_name = Column(String(255), nullable=True)
    insured_name = Column(String(255), nullable=False)
    industry_segment = Column(String(128), nullable=False)
    risk_type = Column(String(32), nullable=False)  # 'CYBER', 'D_AND_O'
    annual_revenue = Column(Numeric(18, 2), nullable=False, default=0.0)
    sum_insured = Column(Numeric(18, 2), nullable=False, default=0.0)
    attachment_point = Column(Numeric(18, 2), nullable=False, default=0.0)
    policy_start_date = Column(String(32), nullable=True)
    policy_end_date = Column(String(32), nullable=True)
    prior_claims_count = Column(Integer, default=0, nullable=False)
    prior_claims_total = Column(Numeric(18, 2), default=0.0, nullable=False)
    security_governance_score = Column(Float, default=0.0, nullable=False)
    risk_score = Column(Float, default=50.0, nullable=False)
    risk_tier = Column(
        String(32), default="MEDIUM", nullable=False
    )  # 'LOW', 'MEDIUM', 'HIGH'
    status = Column(
        String(32), default="SUBMITTED", nullable=False
    )  # 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'DECLINED'

    active_lock_user_id = Column(String(36), nullable=True)
    active_lock_user_name = Column(String(255), nullable=True)
    active_lock_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    carrier = relationship("User", foreign_keys=[carrier_id])
    attachments = relationship(
        "SubmissionAttachment",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="SubmissionAttachment.uploaded_at",
    )
    risk_score_breakdowns = relationship(
        "RiskScoreBreakdown",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="RiskScoreBreakdown.created_at",
    )
    missing_flags = relationship(
        "MissingInformationFlag",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="MissingInformationFlag.created_at",
    )
    decisions = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="UnderwritingDecision.created_at.desc()",
    )

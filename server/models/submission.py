import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from server.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_number = Column(String(50), unique=True, index=True, nullable=False)
    ceding_org_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_underwriter_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    insured_name = Column(String(255), nullable=False)
    line_of_business = Column(
        String(50), nullable=False, index=True
    )  # CYBER, DO, EO, EPLI, MEDMAL
    policy_limit = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    retention = Column(Float, nullable=False)
    proposed_premium = Column(Float, nullable=False)

    effective_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    industry = Column(String(100), nullable=True)
    revenue_band = Column(String(100), nullable=True)
    jurisdiction = Column(String(100), nullable=True)

    status = Column(String(50), nullable=False, default="RECEIVED", index=True)
    # RECEIVED, IN_REVIEW, INFO_REQUESTED, REFERRED_TO_MANAGER, QUOTED, BOUND, DECLINED

    completeness_status = Column(String(50), nullable=False, default="INCOMPLETE")
    # COMPLETE, INCOMPLETE, PENDING

    risk_score_value = Column(Integer, nullable=True)
    risk_tier = Column(String(50), nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL

    decline_reason_code = Column(String(100), nullable=True)
    decline_notes = Column(Text, nullable=True)

    referral_status = Column(
        String(50), nullable=True
    )  # NONE, PENDING, APPROVED, REJECTED
    referral_notes = Column(Text, nullable=True)
    referral_manager_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    referral_decided_at = Column(DateTime, nullable=True)

    additional_data = Column(JSON, nullable=True)

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    ceding_organization = relationship("Organization", back_populates="submissions")
    creator = relationship(
        "User", foreign_keys=[created_by_user_id], back_populates="created_submissions"
    )
    assigned_underwriter = relationship(
        "User",
        foreign_keys=[assigned_underwriter_id],
        back_populates="assigned_submissions",
    )
    referral_manager = relationship("User", foreign_keys=[referral_manager_id])

    documents = relationship(
        "SubmissionDocument", back_populates="submission", cascade="all, delete-orphan"
    )
    risk_scores = relationship(
        "RiskScore",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="desc(RiskScore.evaluated_at)",
    )
    quotes = relationship(
        "Quote",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="desc(Quote.created_at)",
    )
    audit_logs = relationship(
        "SubmissionAuditLog",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="desc(SubmissionAuditLog.created_at)",
    )

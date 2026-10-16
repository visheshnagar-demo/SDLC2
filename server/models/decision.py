import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id"),
        unique=True,
        nullable=False,
    )
    underwriter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    decision = Column(String(20), nullable=False)  # QUOTE, DECLINE
    capacity_offered = Column(Float, nullable=True)
    rate_on_line_pct = Column(Float, nullable=True)
    premium_amount = Column(Float, nullable=True)
    binding_deadline = Column(Date, nullable=True)
    subjectivities = Column(Text, nullable=True)
    decline_reason_code = Column(
        String(50), nullable=True
    )  # RISK_APPETITE_EXCEEDED, INADEQUATE_ATTACHMENT, UNFAVORABLE_LOSS_HISTORY, INCOMPLETE_DATA, OTHER
    decline_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=utc_now, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="decision")
    underwriter = relationship("User", back_populates="decisions")

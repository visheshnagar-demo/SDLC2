import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False
    )
    underwriter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    decision = Column(String(50), nullable=False)  # QUOTE, DECLINE
    capacity_offered = Column(Float, nullable=True)
    rate_on_line_pct = Column(Float, nullable=True)
    premium_amount = Column(Float, nullable=True)
    binding_deadline = Column(String(50), nullable=True)
    subjectivities = Column(Text, nullable=True)
    decline_reason_code = Column(String(100), nullable=True)
    decline_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="decisions")
    underwriter = relationship("User", foreign_keys=[underwriter_id])

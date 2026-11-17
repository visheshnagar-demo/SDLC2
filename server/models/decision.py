import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    underwriter_id = Column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    underwriter_name = Column(String(255), nullable=True)
    decision = Column(String(32), nullable=False)  # 'QUOTE', 'DECLINE'
    capacity_offered = Column(Numeric(18, 2), nullable=True)
    rate_on_line_pct = Column(Float, nullable=True)
    premium_amount = Column(Numeric(18, 2), nullable=True)
    binding_deadline = Column(String(32), nullable=True)
    subjectivities = Column(String(1024), nullable=True)
    decline_reason_code = Column(String(128), nullable=True)
    decline_notes = Column(String(1024), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    submission = relationship("ReinsuranceSubmission", back_populates="decisions")
    underwriter = relationship("User", foreign_keys=[underwriter_id])

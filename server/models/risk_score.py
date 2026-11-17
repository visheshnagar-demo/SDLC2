import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class RiskScoreBreakdown(Base):
    __tablename__ = "risk_score_breakdowns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rule_key = Column(String(128), nullable=False)
    rule_name = Column(String(255), nullable=False)
    score_delta = Column(Float, default=0.0, nullable=False)
    rationale = Column(String(512), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    submission = relationship(
        "ReinsuranceSubmission", back_populates="risk_score_breakdowns"
    )

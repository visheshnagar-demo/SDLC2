import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class RiskScoreBreakdown(Base):
    __tablename__ = "risk_score_breakdowns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False
    )
    rule_key = Column(String(50), nullable=False)
    rule_name = Column(String(255), nullable=False)
    score_delta = Column(Integer, nullable=False)
    rationale = Column(Text, nullable=False)
    evaluated_at = Column(DateTime, default=utc_now, nullable=False)

    submission = relationship(
        "ReinsuranceSubmission", back_populates="risk_score_breakdowns"
    )

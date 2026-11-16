import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base


class RiskScoreBreakdown(Base):
    __tablename__ = "risk_score_breakdowns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False
    )
    rule_key = Column(String(100), nullable=False)
    rule_name = Column(String(255), nullable=False)
    score_delta = Column(Float, nullable=False, default=0.0)
    rationale = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship(
        "ReinsuranceSubmission", back_populates="score_breakdowns"
    )

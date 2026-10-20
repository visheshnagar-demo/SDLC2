import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from server.database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("submissions.id"), nullable=False, index=True
    )
    total_score = Column(Integer, nullable=False)
    risk_tier = Column(String(50), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    score_breakdown = Column(
        JSON, nullable=False
    )  # Dictionary of factor scores and breakdown
    evaluator_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    evaluated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("Submission", back_populates="risk_scores")
    evaluator = relationship("User")

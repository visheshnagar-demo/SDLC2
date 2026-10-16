import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from server.database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    composite_score = Column(Integer, nullable=False, index=True)  # 0-100
    risk_tier = Column(String(32), nullable=False, index=True)  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    score_breakdown = Column(JSON, nullable=False)
    scoring_rules_version = Column(String(16), nullable=False, default="v1.0")

    calculated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    submission = relationship("Submission", back_populates="risk_score")

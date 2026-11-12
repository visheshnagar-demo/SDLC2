import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from server.database import Base


class CyberRiskProfile(Base):
    __tablename__ = "cyber_risk_profiles"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    mfa_enabled = Column(Boolean, nullable=True)
    edr_implemented = Column(Boolean, nullable=True)
    offline_backups = Column(Boolean, nullable=True)
    encryption_at_rest = Column(Boolean, nullable=True)
    record_count = Column(Integer, nullable=True)
    prior_ransomware_claims = Column(Boolean, nullable=True)
    prior_claims_amount = Column(Float, default=0.0, nullable=True)
    security_training = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    submission = relationship("Submission", back_populates="cyber_profile")


class DoRiskProfile(Base):
    __tablename__ = "do_risk_profiles"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    leverage_ratio = Column(Float, nullable=True)
    executive_turnover_rate = Column(Float, nullable=True)
    active_litigation = Column(Boolean, nullable=True)
    litigation_details = Column(Text, nullable=True)
    independent_board_charter = Column(Boolean, nullable=True)
    regulatory_investigations = Column(Boolean, nullable=True)
    annual_revenue = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    submission = relationship("Submission", back_populates="do_profile")

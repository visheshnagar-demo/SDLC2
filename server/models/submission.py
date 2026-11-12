import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    carrier_name = Column(String(255), nullable=False)
    insured_name = Column(String(255), nullable=False)
    risk_type = Column(String(50), nullable=False)  # CYBER | DO
    primary_limit = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    ceded_limit = Column(Float, nullable=False)
    carrier_premium = Column(Float, nullable=False)
    policy_start_date = Column(String(50), nullable=False)
    policy_end_date = Column(String(50), nullable=False)
    status = Column(
        String(50), default="PENDING", nullable=False
    )  # PENDING, QUOTED, DECLINED, BOUND
    risk_score = Column(Float, default=0.0, nullable=False)
    risk_tier = Column(
        String(50), default="MEDIUM", nullable=False
    )  # LOW, MEDIUM, HIGH
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    cyber_profile = relationship(
        "CyberRiskProfile",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )
    do_profile = relationship(
        "DoRiskProfile",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )
    risk_score_detail = relationship(
        "RiskScore",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )
    flags = relationship(
        "MissingInfoFlag", back_populates="submission", cascade="all, delete-orphan"
    )
    decisions = relationship(
        "UnderwritingDecision",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    audit_logs = relationship(
        "AuditLog", back_populates="submission", cascade="all, delete-orphan"
    )

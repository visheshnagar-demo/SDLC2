import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_number = Column(String(32), unique=True, nullable=False, index=True)
    carrier_name = Column(String(255), nullable=False)
    insured_name = Column(String(255), nullable=False)
    risk_type = Column(String(32), nullable=False)  # CYBER or DO
    primary_limit = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    ceded_limit = Column(Float, nullable=False)
    carrier_premium = Column(Float, nullable=False)
    policy_start_date = Column(Date, nullable=False)
    policy_end_date = Column(Date, nullable=False)
    status = Column(String(32), nullable=False, default="SUBMITTED")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    cyber_profile = relationship("CyberRiskProfile", uselist=False, back_populates="submission", cascade="all, delete-orphan")
    do_profile = relationship("DoRiskProfile", uselist=False, back_populates="submission", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="submission", cascade="all, delete-orphan")
    flags = relationship("MissingInfoFlag", back_populates="submission", cascade="all, delete-orphan")
    decisions = relationship("UnderwritingDecision", back_populates="submission", cascade="all, delete-orphan")

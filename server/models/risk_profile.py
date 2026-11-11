import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class CyberRiskProfile(Base):
    __tablename__ = "cyber_risk_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submissions.id"), unique=True, nullable=False)
    industry_sector = Column(String(128), nullable=False)
    record_count = Column(BigInteger, nullable=False, default=0)
    has_mfa_email = Column(Boolean, nullable=False, default=False)
    has_mfa_remote_access = Column(Boolean, nullable=False, default=False)
    has_mfa_admin_accounts = Column(Boolean, nullable=False, default=False)
    has_edr_deployed = Column(Boolean, nullable=False, default=False)
    has_immutable_backups = Column(Boolean, nullable=False, default=False)
    prior_ransomware_claims = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    submission = relationship("Submission", back_populates="cyber_profile")


class DoRiskProfile(Base):
    __tablename__ = "do_risk_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submissions.id"), unique=True, nullable=False)
    company_structure = Column(String(64), nullable=False)  # PUBLIC, PRIVATE, NON_PROFIT
    market_cap = Column(Float, nullable=True)
    debt_to_equity_ratio = Column(Float, nullable=False)
    executive_turnover_count = Column(Integer, nullable=False, default=0)
    has_board_oversight_charter = Column(Boolean, nullable=False, default=False)
    pending_litigation_flag = Column(Boolean, nullable=False, default=False)
    prior_securities_claims = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    submission = relationship("Submission", back_populates="do_profile")

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=generate_uuid)
    quote_number = Column(String, unique=True, nullable=False, index=True)
    insured_name = Column(String, nullable=False)
    line_of_business = Column(String, nullable=False)
    sum_insured = Column(Float, nullable=False)
    deductible = Column(Float, default=0.0, nullable=False)
    structure_type = Column(String, nullable=False)
    attachment_point = Column(Float, default=0.0, nullable=False)
    quoted_premium = Column(Float, nullable=False)
    rate_on_line = Column(Float, nullable=False)
    ceding_commission = Column(Float, default=0.0, nullable=False)
    status = Column(String, default="QUOTED", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    risk_exposure = relationship("RiskExposure", back_populates="quote", uselist=False, cascade="all, delete-orphan")
    binders = relationship("PolicyBinder", back_populates="quote", cascade="all, delete-orphan")


class RiskExposure(Base):
    __tablename__ = "risk_exposures"

    id = Column(String, primary_key=True, default=generate_uuid)
    quote_id = Column(String, ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, unique=True)
    total_exposure = Column(Float, nullable=False)
    probable_maximum_loss = Column(Float, nullable=False)
    cat_risk_score = Column(Integer, default=50, nullable=False)
    underwriting_decision = Column(String, default="PENDING", nullable=False)
    underwriter_notes = Column(Text, nullable=True)
    layers = Column(JSON, default=list, nullable=False)

    quote = relationship("Quote", back_populates="risk_exposure")


class PolicyBinder(Base):
    __tablename__ = "policy_binders"

    id = Column(String, primary_key=True, default=generate_uuid)
    policy_reference_id = Column(String, unique=True, nullable=False, index=True)
    quote_id = Column(String, ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False)
    effective_date = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    bound_by = Column(String, nullable=False)
    binding_timestamp = Column(DateTime, default=utc_now, nullable=False)
    status = Column(String, default="BOUND", nullable=False)
    document_summary = Column(JSON, default=dict, nullable=False)

    quote = relationship("Quote", back_populates="binders")

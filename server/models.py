import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_make = Column(String(100), nullable=False)
    vehicle_year = Column(Integer, nullable=False)
    vehicle_value = Column(Float, nullable=False)
    driver_age = Column(Integer, nullable=False)
    driving_experience = Column(Integer, nullable=False)
    coverage_type = Column(String(100), nullable=False)
    base_premium = Column(Float, nullable=False)
    total_premium = Column(Float, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    status = Column(String(50), default="Calculated", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    factors = relationship("QuoteFactor", back_populates="quote", cascade="all, delete-orphan", lazy="joined")


class QuoteFactor(Base):
    __tablename__ = "quote_factors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quote_id = Column(String(36), ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False)
    factor_name = Column(String(150), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(50), default="adjustment", nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    quote = relationship("Quote", back_populates="factors")

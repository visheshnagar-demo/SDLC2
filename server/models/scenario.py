import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class ScenarioConfigModel(Base):
    __tablename__ = "scenario_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(
        String(50), unique=True, nullable=False, index=True
    )  # conservative, balanced, aggressive
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    projected_sales_delta_pct = Column(Float, nullable=False, default=0.0)
    projected_pb_share_pct = Column(Float, nullable=False, default=0.0)
    projected_in_stock_pct = Column(Float, nullable=False, default=0.0)
    projected_capacity_pct = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    guardrails = relationship(
        "GuardrailPolicyModel", back_populates="scenario", cascade="all, delete-orphan"
    )
    plans = relationship("AssortmentPlanModel", back_populates="scenario")

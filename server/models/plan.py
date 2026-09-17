import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from server.database import Base


class AssortmentPlanModel(Base):
    __tablename__ = "assortment_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    audit_id = Column(String(100), unique=True, nullable=False, index=True)
    cluster_id = Column(String(36), ForeignKey("clusters.id"), nullable=False)
    scenario_id = Column(String(36), ForeignKey("scenario_configs.id"), nullable=False)
    submitted_by = Column(String(255), nullable=False, default="Category Manager")
    status = Column(String(50), nullable=False, default="APPROVED")
    total_sku_actions = Column(Integer, nullable=False, default=0)
    guardrail_status = Column(String(50), nullable=False, default="ALL_PASSED")
    summary_snapshot = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    cluster = relationship("ClusterModel", back_populates="plans")
    scenario = relationship("ScenarioConfigModel", back_populates="plans")
    actions = relationship(
        "PlanSkuActionModel", back_populates="plan", cascade="all, delete-orphan"
    )


class PlanSkuActionModel(Base):
    __tablename__ = "plan_sku_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String(36), ForeignKey("assortment_plans.id"), nullable=False)
    sku_id = Column(String(36), ForeignKey("snacks_skus.id"), nullable=False)
    action_type = Column(
        String(50), nullable=False
    )  # "GROW", "MAINTAIN", "SWAP", "REDUCE"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    plan = relationship("AssortmentPlanModel", back_populates="actions")
    sku = relationship("SnacksSkuModel", back_populates="actions")

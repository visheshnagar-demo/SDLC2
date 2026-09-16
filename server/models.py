import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class StoreCluster(Base):
    __tablename__ = "store_clusters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_code = Column(String(50), unique=True, index=True, nullable=False)
    cluster_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, default="Snacks")
    sales_per_linear_ft = Column(Float, nullable=False, default=125.0)
    private_brand_pct = Column(Float, nullable=False, default=32.0)
    in_stock_rate_pct = Column(Float, nullable=False, default=96.5)
    shelf_capacity_pct = Column(Float, nullable=False, default=88.0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    skus = relationship(
        "SkuItem", back_populates="cluster", cascade="all, delete-orphan"
    )
    plans = relationship(
        "AssortmentPlan", back_populates="cluster", cascade="all, delete-orphan"
    )


class SkuItem(Base):
    __tablename__ = "sku_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(
        String(36),
        ForeignKey("store_clusters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sku_code = Column(String(50), index=True, nullable=False)
    name = Column(String(200), nullable=False)
    brand_type = Column(
        String(20), nullable=False
    )  # 'PRIVATE_BRAND' | 'NATIONAL_BRAND'
    weekly_sales_units = Column(Integer, nullable=False, default=0)
    sales_volume_usd = Column(Float, nullable=False, default=0.0)
    margin_pct = Column(Float, nullable=False, default=0.0)
    linear_space_inches = Column(Float, nullable=False, default=0.0)
    recommended_action = Column(
        String(20), nullable=False
    )  # 'GROW' | 'MAINTAIN' | 'SWAP' | 'REDUCE'
    status_badge_color = Column(
        String(20), nullable=False, default="blue"
    )  # 'green' | 'blue' | 'yellow' | 'red'
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    cluster = relationship("StoreCluster", back_populates="skus")


class ScenarioConfig(Base):
    __tablename__ = "scenario_configs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scenario_type = Column(
        String(20), unique=True, index=True, nullable=False
    )  # CONSERVATIVE | BALANCED | AGGRESSIVE
    scenario_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    sales_delta_percentage = Column(Float, nullable=False, default=0.0)
    margin_delta_percentage = Column(Float, nullable=False, default=0.0)
    private_brand_mix_delta = Column(Float, nullable=False, default=0.0)
    shelf_capacity_projected_percentage = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )


class AssortmentPlan(Base):
    __tablename__ = "assortment_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(
        String(36),
        ForeignKey("store_clusters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    audit_id = Column(String(50), unique=True, index=True, nullable=False)
    scenario_type = Column(String(20), nullable=False)
    status = Column(
        String(20), nullable=False, default="SUBMITTED"
    )  # SUBMITTED | APPROVED | REJECTED
    projected_sales_delta_pct = Column(Float, nullable=False, default=0.0)
    projected_margin_delta_pct = Column(Float, nullable=False, default=0.0)
    projected_pb_mix_delta = Column(Float, nullable=False, default=0.0)
    guardrail_status = Column(String(20), nullable=False, default="ALL_PASSED")
    submitted_by = Column(String(150), nullable=False)
    submitted_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    cluster = relationship("StoreCluster", back_populates="plans")
    actions = relationship(
        "PlanSkuAction", back_populates="plan", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "PlanAuditLog", back_populates="plan", cascade="all, delete-orphan"
    )


class PlanSkuAction(Base):
    __tablename__ = "plan_sku_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    plan_id = Column(
        String(36),
        ForeignKey("assortment_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sku_id = Column(String(36), nullable=True)
    sku_code = Column(String(50), nullable=False)
    sku_name = Column(String(200), nullable=False)
    action = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    plan = relationship("AssortmentPlan", back_populates="actions")


class PlanAuditLog(Base):
    __tablename__ = "plan_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    plan_id = Column(
        String(36),
        ForeignKey("assortment_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    audit_id = Column(String(50), index=True, nullable=False)
    event_type = Column(String(50), nullable=False, default="PLAN_SUBMITTED")
    payload_snapshot = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    plan = relationship("AssortmentPlan", back_populates="audit_logs")

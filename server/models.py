import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def get_utc_now():
    return datetime.now(timezone.utc)


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="Snacks", nullable=False)
    target_pb_pct = Column(Float, default=25.0, nullable=False)
    shelf_capacity_lin_ft = Column(Float, default=1250.0, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False
    )

    skus = relationship("SKU", back_populates="cluster", cascade="all, delete-orphan")
    assortment_plans = relationship("AssortmentPlan", back_populates="cluster")


class SKU(Base):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(
        String(36), ForeignKey("clusters.id"), nullable=False, index=True
    )
    sku_number = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(100), nullable=False)
    is_private_brand = Column(Boolean, default=False, nullable=False)
    sales_amount = Column(Float, nullable=False, default=0.0)
    sales_per_linear_foot = Column(Float, nullable=False, default=0.0)
    margin_percentage = Column(Float, nullable=False, default=0.0)
    velocity_units_per_week = Column(Integer, nullable=False, default=0)
    shelf_space_linear_ft = Column(Float, nullable=False, default=0.0)
    status_badge = Column(String(20), nullable=False, default="MAINTAIN")
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False
    )

    cluster = relationship("Cluster", back_populates="skus")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    projected_sales_lift_pct = Column(Float, nullable=False, default=0.0)
    projected_private_brand_change_pct = Column(Float, nullable=False, default=0.0)
    projected_shelf_utilization_pct = Column(Float, nullable=False, default=0.0)
    actions_summary = Column(JSON, nullable=False, default=dict)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False
    )


class AssortmentPlan(Base):
    __tablename__ = "assortment_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(50), unique=True, index=True, nullable=False)
    cluster_id = Column(String(36), ForeignKey("clusters.id"), nullable=False)
    scenario_id = Column(String(50), nullable=False)
    submitted_by = Column(String(150), nullable=False)
    status = Column(String(30), default="APPROVED", nullable=False)
    notes = Column(Text, nullable=True)
    sku_action_summary = Column(JSON, nullable=False, default=dict)
    guardrail_results = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    cluster = relationship("Cluster", back_populates="assortment_plans")
    audit_logs = relationship(
        "AuditLog", back_populates="plan", cascade="all, delete-orphan"
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    plan_id = Column(String(36), ForeignKey("assortment_plans.id"), nullable=True)
    event_type = Column(String(50), nullable=False)
    user_id = Column(String(150), nullable=False)
    payload = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    plan = relationship("AssortmentPlan", back_populates="audit_logs")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

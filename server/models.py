import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    Integer,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    category = Column(String(50), nullable=False, default="Snacks")
    total_linear_feet = Column(Float, nullable=False, default=48.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    skus = relationship("SKU", back_populates="cluster", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="cluster", cascade="all, delete-orphan")
    submissions = relationship("AssortmentSubmission", back_populates="cluster", cascade="all, delete-orphan")


class SKU(Base):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey("clusters.id"), nullable=False, index=True)
    sku_code = Column(String(50), nullable=False, index=True)
    product_name = Column(String(150), nullable=False)
    brand_name = Column(String(100), nullable=False)
    is_private_brand = Column(Boolean, nullable=False, default=False)
    sub_category = Column(String(50), nullable=False)
    weekly_sales_volume = Column(Float, nullable=False, default=0.0)
    sales_per_linear_ft = Column(Float, nullable=False, default=0.0)
    linear_feet_allocated = Column(Float, nullable=False, default=1.0)
    in_stock_rate = Column(Float, nullable=False, default=100.0)
    status_badge = Column(String(20), nullable=False, default="MAINTAIN")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cluster = relationship("Cluster", back_populates="skus")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey("clusters.id"), nullable=False, index=True)
    scenario_type = Column(String(30), nullable=False)  # CONSERVATIVE, BALANCED, AGGRESSIVE
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, nullable=False, default=False)
    projected_sales_delta_pct = Column(Float, nullable=False, default=0.0)
    projected_pb_shift_pct = Column(Float, nullable=False, default=0.0)
    projected_space_util_pct = Column(Float, nullable=False, default=0.0)
    min_private_brand_met = Column(Boolean, nullable=False, default=True)
    capacity_threshold_met = Column(Boolean, nullable=False, default=True)
    overall_guardrail_status = Column(String(20), nullable=False, default="PASSED")
    add_count = Column(Integer, nullable=False, default=0)
    keep_count = Column(Integer, nullable=False, default=0)
    swap_count = Column(Integer, nullable=False, default=0)
    remove_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cluster = relationship("Cluster", back_populates="scenarios")
    submissions = relationship("AssortmentSubmission", back_populates="scenario", cascade="all, delete-orphan")


class AssortmentSubmission(Base):
    __tablename__ = "assortment_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey("clusters.id"), nullable=False, index=True)
    scenario_id = Column(String(36), ForeignKey("scenarios.id"), nullable=False)
    scenario_type = Column(String(30), nullable=False)
    audit_reference = Column(String(50), nullable=False, unique=True, index=True)
    submitted_by_user = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    guardrail_status = Column(String(20), nullable=False, default="PASSED")
    checksum = Column(String(64), nullable=True)
    audit_summary_json = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="CONFIRMED")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    cluster = relationship("Cluster", back_populates="submissions")
    scenario = relationship("Scenario", back_populates="submissions")

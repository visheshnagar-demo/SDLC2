import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON
from server.database import Base


class SKUModel(Base):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku_code = Column(String(50), unique=True, index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), default="Snacks", nullable=False)
    weekly_sales = Column(Float, nullable=False)
    margin_pct = Column(Float, nullable=False)
    shelf_space_ft = Column(Float, nullable=False)
    status_badge = Column(String(20), nullable=False)  # GROW, MAINTAIN, SWAP, REDUCE
    is_private_brand = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class ScenarioProjectionModel(Base):
    __tablename__ = "scenario_projections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_key = Column(
        String(50), unique=True, index=True, nullable=False
    )  # conservative, balanced, aggressive
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    projected_sales_per_linear_ft = Column(Float, nullable=False)
    projected_private_brand_pct = Column(Float, nullable=False)
    projected_in_stock_rate_pct = Column(Float, nullable=False)
    projected_shelf_capacity_pct = Column(Float, nullable=False)
    action_grow_count = Column(Integer, default=0, nullable=False)
    action_maintain_count = Column(Integer, default=0, nullable=False)
    action_swap_count = Column(Integer, default=0, nullable=False)
    action_reduce_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class AssortmentSubmissionModel(Base):
    __tablename__ = "assortment_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    audit_confirmation_id = Column(String(50), unique=True, index=True, nullable=False)
    scenario_key = Column(String(50), nullable=False)
    scenario_name = Column(String(50), nullable=False)
    user_id = Column(String(100), nullable=False)
    justification_note = Column(Text, nullable=True)
    guardrail_status = Column(String(20), nullable=False)  # PASSED, WARNING, FAILED
    audit_trail_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

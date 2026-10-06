import uuid
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    Text,
    JSON,
    func,
)
from server.database import Base


class KPIModel(Base):
    __tablename__ = "kpis"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String(100), nullable=False, unique=True, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False, default="")
    target_value = Column(Float, nullable=True)
    status_text = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class SKUModel(Base):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku_id = Column(String(100), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Snacks", index=True)
    sales = Column(Float, nullable=False, default=0.0)
    movement = Column(Integer, nullable=False, default=0)
    margin_percentage = Column(Float, nullable=False, default=0.0)
    velocity = Column(Float, nullable=False, default=0.0)
    recommended_action = Column(String(50), nullable=False, default="MAINTAIN")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class ScenarioModel(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_type = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    projected_sales_increase_pct = Column(Float, nullable=False, default=0.0)
    private_brand_change_pct = Column(Float, nullable=False, default=0.0)
    shelf_utilization_pct = Column(Float, nullable=False, default=0.0)
    is_preselected = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class AssortmentPlanModel(Base):
    __tablename__ = "assortment_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    audit_id = Column(String(100), nullable=False, unique=True, index=True)
    user_id = Column(String(100), nullable=False)
    cluster_id = Column(String(100), nullable=False, default="STV-042")
    scenario_selected = Column(String(100), nullable=False)
    sku_action_summary = Column(JSON, nullable=False, default=dict)
    detailed_sku_actions = Column(JSON, nullable=False, default=list)
    guardrail_status = Column(JSON, nullable=False, default=dict)
    submission_timestamp = Column(DateTime, server_default=func.now(), nullable=False)
    status = Column(String(50), nullable=False, default="SUBMITTED")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

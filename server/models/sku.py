import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class SnacksSkuModel(Base):
    __tablename__ = "snacks_skus"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_id = Column(String(36), ForeignKey("clusters.id"), nullable=False)
    sku_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    subcategory = Column(String(100), nullable=False, index=True)
    brand_tier = Column(String(50), nullable=False)  # "Private Brand", "National Brand"
    sales_per_lin_ft = Column(Float, nullable=False, default=0.0)
    margin_pct = Column(Float, nullable=False, default=0.0)
    weekly_unit_velocity = Column(Float, nullable=False, default=0.0)
    in_stock_pct = Column(Float, nullable=False, default=100.0)
    shelf_linear_ft = Column(Float, nullable=False, default=1.0)
    status_badge = Column(
        String(20), nullable=False, default="MAINTAIN"
    )  # "GROW", "MAINTAIN", "SWAP", "REDUCE"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    cluster = relationship("ClusterModel", back_populates="skus")
    actions = relationship(
        "PlanSkuActionModel", back_populates="sku", cascade="all, delete-orphan"
    )

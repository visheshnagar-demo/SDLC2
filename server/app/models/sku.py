import uuid
from sqlalchemy import (
    Column,
    String,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Sku(Base):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_id = Column(
        String(36),
        ForeignKey("clusters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sku_code = Column(String(50), nullable=False)
    product_name = Column(String(200), nullable=False)
    sub_category = Column(String(100), nullable=False)
    sales_velocity = Column(Numeric(10, 2), nullable=False, default=0.00)
    sales_per_linear_ft = Column(Numeric(10, 2), nullable=False, default=0.00)
    linear_ft_required = Column(Numeric(6, 2), nullable=False, default=1.00)
    is_private_brand = Column(Boolean, nullable=False, default=False)
    status_badge = Column(
        String(20), nullable=False, index=True
    )  # GROW, MAINTAIN, SWAP, REDUCE
    instock_rate = Column(Numeric(5, 2), nullable=False, default=100.00)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("cluster_id", "sku_code", name="uq_cluster_sku"),
    )

    cluster = relationship("Cluster", back_populates="skus")

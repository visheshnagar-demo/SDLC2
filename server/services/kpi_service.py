from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models import Cluster, SKU
from server.schemas import ClusterKPIResponse, KPIValues


def get_cluster_kpis(db: Session, cluster_id: str) -> ClusterKPIResponse:
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID '{cluster_id}' not found",
        )

    skus = db.query(SKU).filter(SKU.cluster_id == cluster_id).all()

    if not skus:
        # Defaults if no SKUs exist yet
        kpi_vals = KPIValues(
            sales_per_linear_foot=0.0,
            private_brand_percentage=0.0,
            in_stock_rate_percentage=0.0,
            shelf_capacity_utilization_percentage=0.0,
        )
    else:
        total_allocated_feet = sum(sku.linear_feet_allocated for sku in skus)
        total_sales_weighted = sum(
            sku.sales_per_linear_ft * sku.linear_feet_allocated for sku in skus
        )
        sales_per_linear_foot = (
            round(total_sales_weighted / total_allocated_feet, 2)
            if total_allocated_feet > 0
            else 0.0
        )

        pb_feet = sum(
            sku.linear_feet_allocated for sku in skus if sku.is_private_brand
        )
        pb_percentage = (
            round((pb_feet / total_allocated_feet) * 100, 2)
            if total_allocated_feet > 0
            else 0.0
        )

        # In stock rate weighted by allocated feet
        in_stock_sum = sum(
            sku.in_stock_rate * sku.linear_feet_allocated for sku in skus
        )
        in_stock_rate_pct = (
            round(in_stock_sum / total_allocated_feet, 2)
            if total_allocated_feet > 0
            else 0.0
        )

        capacity_util_pct = (
            round((total_allocated_feet / cluster.total_linear_feet) * 100, 2)
            if cluster.total_linear_feet > 0
            else 0.0
        )

        kpi_vals = KPIValues(
            sales_per_linear_foot=sales_per_linear_foot,
            private_brand_percentage=pb_percentage,
            in_stock_rate_percentage=in_stock_rate_pct,
            shelf_capacity_utilization_percentage=capacity_util_pct,
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    return ClusterKPIResponse(
        cluster_id=cluster.id,
        cluster_name=cluster.name,
        category=cluster.category,
        kpis=kpi_vals,
        last_updated=now_iso,
    )

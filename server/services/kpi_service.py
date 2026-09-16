from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from server.models import StoreCluster
from server.schemas import ClusterKpiResponse, KpiMetrics


def get_cluster_kpis(
    db: Session, cluster_id_or_code: str = "STV-CLUSTER-01"
) -> ClusterKpiResponse:
    cluster = (
        db.query(StoreCluster)
        .filter(
            (StoreCluster.cluster_code == cluster_id_or_code)
            | (StoreCluster.id == cluster_id_or_code)
        )
        .first()
    )

    if not cluster:
        # Fallback to first available cluster
        cluster = db.query(StoreCluster).first()

    if not cluster:
        raise HTTPException(status_code=404, detail="Store cluster not found.")

    formatted_linear_sales = f"${cluster.sales_per_linear_ft:.2f}/ft"

    metrics_obj = KpiMetrics(
        sales_per_linear_ft=cluster.sales_per_linear_ft,
        sales_per_linear_ft_formatted=formatted_linear_sales,
        private_brand_percentage=cluster.private_brand_pct,
        in_stock_rate_percentage=cluster.in_stock_rate_pct,
        shelf_capacity_percentage=cluster.shelf_capacity_pct,
    )

    return ClusterKpiResponse(
        cluster_id=cluster.cluster_code,
        cluster_name=cluster.cluster_name,
        category=cluster.category,
        sales_per_linear_ft=cluster.sales_per_linear_ft,
        sales_per_linear_ft_formatted=formatted_linear_sales,
        private_brand_percentage=cluster.private_brand_pct,
        in_stock_rate_percentage=cluster.in_stock_rate_pct,
        shelf_capacity_percentage=cluster.shelf_capacity_pct,
        metrics=metrics_obj,
        updated_at=cluster.updated_at or datetime.now(timezone.utc),
    )

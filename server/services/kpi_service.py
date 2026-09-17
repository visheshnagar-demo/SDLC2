from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from server.models.cluster import ClusterModel
from server.models.sku import SnacksSkuModel
from server.schemas.kpi import KpiResponse


class KpiService:
    @staticmethod
    def get_cluster_kpis(db: Session, cluster_code: str = "STV-CLUSTER") -> KpiResponse:
        cluster = db.query(ClusterModel).filter_by(cluster_code=cluster_code).first()
        if not cluster:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cluster '{cluster_code}' not found",
            )

        skus = db.query(SnacksSkuModel).filter_by(cluster_id=cluster.id).all()
        if not skus:
            return KpiResponse(
                sales_per_linear_foot=0.0,
                private_brand_percentage=0.0,
                in_stock_rate=100.0,
                shelf_capacity=0.0,
                cluster_code=cluster.cluster_code,
                cluster_name=cluster.name,
                total_linear_feet=cluster.total_linear_feet,
                used_linear_feet=0.0,
                total_skus_count=0,
            )

        total_skus = len(skus)
        total_used_feet = sum(s.shelf_linear_ft for s in skus)
        total_sales_dollars = sum(s.sales_per_lin_ft * s.shelf_linear_ft for s in skus)
        sales_per_linear_foot = round(
            total_sales_dollars / total_used_feet if total_used_feet > 0 else 0.0, 2
        )

        pb_used_feet = sum(
            s.shelf_linear_ft for s in skus if s.brand_tier == "Private Brand"
        )
        private_brand_pct = round(
            (pb_used_feet / total_used_feet * 100.0) if total_used_feet > 0 else 0.0, 1
        )

        avg_in_stock = round(sum(s.in_stock_pct for s in skus) / total_skus, 1)
        capacity_pct = round(
            (total_used_feet / cluster.total_linear_feet * 100.0)
            if cluster.total_linear_feet > 0
            else 0.0,
            1,
        )

        return KpiResponse(
            sales_per_linear_foot=sales_per_linear_foot,
            private_brand_percentage=private_brand_pct,
            in_stock_rate=avg_in_stock,
            shelf_capacity=capacity_pct,
            cluster_code=cluster.cluster_code,
            cluster_name=cluster.name,
            total_linear_feet=cluster.total_linear_feet,
            used_linear_feet=round(total_used_feet, 2),
            total_skus_count=total_skus,
        )

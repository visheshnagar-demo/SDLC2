from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.models import SkuItem, StoreCluster
from server.schemas import SkuListResponse, SkuItemResponse


def get_skus(
    db: Session,
    cluster_id_or_code: str = "STV-CLUSTER-01",
    search: Optional[str] = None,
    brand_type: Optional[str] = None,
    action: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> SkuListResponse:
    # Resolve cluster if needed
    cluster = (
        db.query(StoreCluster)
        .filter(
            (StoreCluster.cluster_code == cluster_id_or_code)
            | (StoreCluster.id == cluster_id_or_code)
        )
        .first()
    )

    query = db.query(SkuItem)
    if cluster:
        query = query.filter(SkuItem.cluster_id == cluster.id)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                SkuItem.name.ilike(search_pattern),
                SkuItem.sku_code.ilike(search_pattern),
            )
        )

    if brand_type:
        query = query.filter(SkuItem.brand_type.ilike(brand_type.strip()))

    if action:
        query = query.filter(SkuItem.recommended_action.ilike(action.strip()))

    total_count = query.count()
    items = query.order_by(SkuItem.sku_code.asc()).offset(skip).limit(limit).all()

    sku_responses = [
        SkuItemResponse(
            id=item.id,
            sku_code=item.sku_code,
            name=item.name,
            brand_type=item.brand_type,
            weekly_sales_units=item.weekly_sales_units,
            sales_volume_usd=item.sales_volume_usd,
            margin_percentage=item.margin_pct,
            linear_space_inches=item.linear_space_inches,
            recommended_action=item.recommended_action,
            status_badge_color=item.status_badge_color,
        )
        for item in items
    ]

    return SkuListResponse(total_count=total_count, skus=sku_responses)

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from server.models import Cluster, SKU
from server.schemas import SKUListResponse, SKUResponse


def list_cluster_skus(
    db: Session,
    cluster_id: str,
    status_badge: Optional[str] = None,
    sub_category: Optional[str] = None,
    is_private_brand: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> SKUListResponse:
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID '{cluster_id}' not found",
        )

    query = db.query(SKU).filter(SKU.cluster_id == cluster_id)

    if status_badge:
        query = query.filter(func.upper(SKU.status_badge) == status_badge.strip().upper())

    if sub_category:
        query = query.filter(func.lower(SKU.sub_category) == sub_category.strip().lower())

    if is_private_brand is not None:
        query = query.filter(SKU.is_private_brand == is_private_brand)

    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.filter(
            func.lower(SKU.product_name).like(search_pattern)
            | func.lower(SKU.brand_name).like(search_pattern)
            | func.lower(SKU.sku_code).like(search_pattern)
        )

    total = query.count()
    items = (
        query.order_by(SKU.sales_per_linear_ft.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return SKUListResponse(
        total=total,
        items=[SKUResponse.model_validate(item) for item in items],
    )

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import SKU, Cluster
from server.schemas import SKUListResponse, SKUResponse

router = APIRouter(prefix="/skus", tags=["skus"])


@router.get("", response_model=SKUListResponse)
def get_skus(
    category: Optional[str] = Query(None, description="Category filter (e.g. Snacks)"),
    status: Optional[str] = Query(
        None, description="Status badge filter (GROW, MAINTAIN, SWAP, REDUCE)"
    ),
    is_private_brand: Optional[bool] = Query(
        None, description="Filter by Private Brand flag"
    ),
    search: Optional[str] = Query(
        None, description="Search keyword for name or SKU number"
    ),
    db: Session = Depends(get_db),
):
    query = db.query(SKU)

    if category:
        query = query.join(Cluster).filter(Cluster.category.ilike(f"%{category}%"))

    if status and status.upper() != "ALL":
        query = query.filter(SKU.status_badge == status.upper())

    if is_private_brand is not None:
        query = query.filter(SKU.is_private_brand == is_private_brand)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (SKU.name.ilike(search_filter))
            | (SKU.sku_number.ilike(search_filter))
            | (SKU.brand.ilike(search_filter))
        )

    skus = query.all()
    items = [SKUResponse.from_orm(sku) for sku in skus]

    return SKUListResponse(total=len(items), items=items)

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.sku import SkuListResponse
from app.services.assortment_service import get_cluster_skus

router = APIRouter()


@router.get("/skus", response_model=SkuListResponse)
def get_skus(
    cluster_id: Optional[str] = Query(
        "small_town_value", description="Target store cluster identifier"
    ),
    sub_category: Optional[str] = Query(
        None, description="Filter by Snacks subcategory"
    ),
    badge: Optional[str] = Query(
        None, description="Filter by status badge (GROW, MAINTAIN, SWAP, REDUCE)"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve SKU catalog with velocity, efficiency metrics, and recommendation badges."""
    return get_cluster_skus(db, cluster_id, sub_category, badge)

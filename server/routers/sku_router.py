from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import SkuListResponse
from server.services.sku_service import get_skus

router = APIRouter(tags=["SKU Assortment"])


@router.get("/api/v1/skus", response_model=SkuListResponse)
def get_skus_endpoint(
    cluster_id: Optional[str] = Query(
        default="STV-CLUSTER-01", description="Cluster ID or code"
    ),
    search: Optional[str] = Query(
        default=None, description="Search by SKU code or name"
    ),
    brand_type: Optional[str] = Query(
        default=None, description="Filter by brand type (PRIVATE_BRAND/NATIONAL_BRAND)"
    ),
    action: Optional[str] = Query(
        default=None,
        description="Filter by recommended action (GROW/MAINTAIN/SWAP/REDUCE)",
    ),
    skip: int = Query(default=0, ge=0, description="Pagination skip offset"),
    limit: int = Query(default=50, ge=1, le=200, description="Pagination limit"),
    db: Session = Depends(get_db),
):
    """
    Fetch Snacks category SKUs with performance metrics and status badges
    (GROW, MAINTAIN, SWAP, REDUCE).
    """
    return get_skus(
        db=db,
        cluster_id_or_code=cluster_id or "STV-CLUSTER-01",
        search=search,
        brand_type=brand_type,
        action=action,
        skip=skip,
        limit=limit,
    )

from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.services.sku_service import SkuService
from server.schemas.sku import SkuListResponse, SkuResponse, SkuCreate, SkuUpdate

router = APIRouter(prefix="/skus", tags=["SKUs"])


@router.get("", response_model=SkuListResponse)
def get_skus(
    search: Optional[str] = Query(
        None, description="Search by SKU name, code, or subcategory"
    ),
    category: Optional[str] = Query(None, description="Category filter (e.g. Snacks)"),
    subcategory: Optional[str] = Query(None, description="Filter by subcategory"),
    status_badge: Optional[str] = Query(
        None, description="Filter by status badge (GROW, MAINTAIN, SWAP, REDUCE)"
    ),
    brand_tier: Optional[str] = Query(
        None, description="Filter by brand tier (Private Brand, National Brand)"
    ),
    cluster_code: Optional[str] = Query(
        None, description="Filter by cluster code (e.g. STV-CLUSTER)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve Snacks SKU list with performance metrics and color-coded status badges."""
    return SkuService.get_skus(
        db=db,
        search=search,
        category=category,
        subcategory=subcategory,
        status_badge=status_badge,
        brand_tier=brand_tier,
        cluster_code=cluster_code,
        skip=skip,
        limit=limit,
    )


@router.get("/{sku_id}", response_model=SkuResponse)
def get_sku(sku_id: str, db: Session = Depends(get_db)):
    """Retrieve a single SKU by ID or SKU Code."""
    sku = SkuService.get_sku_by_id(db, sku_id)
    if not sku:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"SKU '{sku_id}' not found"
        )
    return SkuResponse.model_validate(sku)


@router.post("", response_model=SkuResponse, status_code=status.HTTP_201_CREATED)
def create_sku(sku_in: SkuCreate, db: Session = Depends(get_db)):
    """Create a new Snacks SKU."""
    sku = SkuService.create_sku(db, sku_in)
    return SkuResponse.model_validate(sku)


@router.patch("/{sku_id}", response_model=SkuResponse)
def update_sku(sku_id: str, sku_in: SkuUpdate, db: Session = Depends(get_db)):
    """Update SKU attributes or status badge."""
    sku = SkuService.update_sku(db, sku_id, sku_in)
    if not sku:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"SKU '{sku_id}' not found"
        )
    return SkuResponse.model_validate(sku)

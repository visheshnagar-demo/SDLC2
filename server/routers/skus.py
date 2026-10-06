from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import SKUResponse, SKUCreate
from server import crud

router = APIRouter(prefix="/api/v1/skus", tags=["SKUs"])


@router.get("", response_model=List[SKUResponse])
@router.get("/", response_model=List[SKUResponse])
def get_skus(
    category: Optional[str] = Query(
        None, description="Filter by category (e.g. Snacks)"
    ),
    action: Optional[str] = Query(
        None, description="Filter by action (GROW, MAINTAIN, SWAP, REDUCE)"
    ),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Max items to return"),
    db: Session = Depends(get_db),
):
    """Retrieve list of Snacks SKUs with performance metrics and recommended actions."""
    return crud.get_skus(db, category=category, action=action, skip=skip, limit=limit)


@router.get("/{sku_id}", response_model=SKUResponse)
def get_sku(sku_id: str, db: Session = Depends(get_db)):
    """Retrieve a single SKU by SKU ID or internal ID."""
    sku = crud.get_sku_by_id(db, sku_id)
    if not sku:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKU '{sku_id}' not found",
        )
    return SKUResponse(
        id=sku.id,
        sku_id=sku.sku_id,
        name=sku.name,
        category=sku.category,
        sales=sku.sales,
        movement=sku.movement,
        margin_percentage=sku.margin_percentage,
        velocity=sku.velocity,
        recommended_action=sku.recommended_action,
        action=sku.recommended_action,
    )


@router.post("", response_model=SKUResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SKUResponse, status_code=status.HTTP_201_CREATED)
def create_sku(sku_in: SKUCreate, db: Session = Depends(get_db)):
    """Create a new SKU entry."""
    existing = crud.get_sku_by_id(db, sku_in.sku_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SKU with ID '{sku_in.sku_id}' already exists",
        )
    created = crud.create_sku(db, sku_in)
    return SKUResponse(
        id=created.id,
        sku_id=created.sku_id,
        name=created.name,
        category=created.category,
        sales=created.sales,
        movement=created.movement,
        margin_percentage=created.margin_percentage,
        velocity=created.velocity,
        recommended_action=created.recommended_action,
        action=created.recommended_action,
    )

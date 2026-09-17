from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class SkuBase(BaseModel):
    sku_code: str
    name: str
    subcategory: str
    brand_tier: str
    sales_per_lin_ft: float
    margin_pct: float
    weekly_unit_velocity: float
    in_stock_pct: float
    shelf_linear_ft: float
    status_badge: str  # "GROW", "MAINTAIN", "SWAP", "REDUCE"


class SkuCreate(SkuBase):
    cluster_id: Optional[str] = None


class SkuUpdate(BaseModel):
    name: Optional[str] = None
    subcategory: Optional[str] = None
    brand_tier: Optional[str] = None
    sales_per_lin_ft: Optional[float] = None
    margin_pct: Optional[float] = None
    weekly_unit_velocity: Optional[float] = None
    in_stock_pct: Optional[float] = None
    shelf_linear_ft: Optional[float] = None
    status_badge: Optional[str] = None


class SkuResponse(SkuBase):
    id: str
    cluster_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SkuListResponse(BaseModel):
    items: List[SkuResponse]
    total: int
    skip: int
    limit: int

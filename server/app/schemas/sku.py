from typing import List
from pydantic import BaseModel, ConfigDict


class SkuItem(BaseModel):
    id: str
    sku_code: str
    product_name: str
    sub_category: str
    sales_velocity: float
    sales_per_linear_ft: float
    linear_ft_required: float
    is_private_brand: bool
    status_badge: str
    instock_rate: float

    model_config = ConfigDict(from_attributes=True)


class SkuListResponse(BaseModel):
    total_skus: int
    items: List[SkuItem]

    model_config = ConfigDict(from_attributes=True)

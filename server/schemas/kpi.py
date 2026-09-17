from pydantic import BaseModel


class KpiResponse(BaseModel):
    sales_per_linear_foot: float
    private_brand_percentage: float
    in_stock_rate: float
    shelf_capacity: float
    cluster_code: str
    cluster_name: str
    total_linear_feet: float
    used_linear_feet: float
    total_skus_count: int

    class Config:
        from_attributes = True

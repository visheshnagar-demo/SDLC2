from pydantic import BaseModel, ConfigDict


class KpiResponse(BaseModel):
    cluster_id: str
    cluster_name: str
    sales_per_linear_ft: float
    sales_per_linear_ft_formatted: str
    private_brand_percentage: float
    private_brand_percentage_formatted: str
    instock_rate: float
    instock_rate_formatted: str
    shelf_capacity_used_ft: float
    shelf_capacity_total_ft: float
    shelf_capacity_percentage: float
    shelf_capacity_formatted: str

    model_config = ConfigDict(from_attributes=True)

from fastapi import APIRouter
from app.api.v1.endpoints import (
    kpis_router,
    skus_router,
    scenarios_router,
    approvals_router,
)

api_router = APIRouter()
api_router.include_router(kpis_router, prefix="/assortment", tags=["Assortment KPIs"])
api_router.include_router(skus_router, prefix="/assortment", tags=["SKU Performance"])
api_router.include_router(
    scenarios_router, prefix="/assortment", tags=["Scenario Impact"]
)
api_router.include_router(
    approvals_router, prefix="/assortment", tags=["Approval Audit"]
)

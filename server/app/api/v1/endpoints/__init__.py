from app.api.v1.endpoints.kpis import router as kpis_router
from app.api.v1.endpoints.skus import router as skus_router
from app.api.v1.endpoints.scenarios import router as scenarios_router
from app.api.v1.endpoints.approvals import router as approvals_router

__all__ = ["kpis_router", "skus_router", "scenarios_router", "approvals_router"]

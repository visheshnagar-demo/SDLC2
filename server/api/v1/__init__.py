from fastapi import APIRouter
from server.api.v1.kpis import router as kpis_router
from server.api.v1.skus import router as skus_router
from server.api.v1.scenarios import router as scenarios_router
from server.api.v1.assortment import router as assortment_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(kpis_router)
api_v1_router.include_router(skus_router)
api_v1_router.include_router(scenarios_router)
api_v1_router.include_router(assortment_router)

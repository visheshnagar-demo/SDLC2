from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.kpi import KpiResponse
from app.services.assortment_service import get_cluster_kpis

router = APIRouter()


@router.get("/kpis", response_model=KpiResponse)
def get_kpis(
    cluster_id: Optional[str] = Query(
        "small_town_value", description="Target store cluster identifier"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve live baseline KPI metrics for the cluster."""
    return get_cluster_kpis(db, cluster_id)

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.services.kpi_service import KpiService
from server.schemas.kpi import KpiResponse

router = APIRouter(prefix="/kpis", tags=["KPIs"])


@router.get("", response_model=KpiResponse)
def get_kpis(
    cluster_code: str = Query(
        "STV-CLUSTER", description="Cluster code for aggregate metrics"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve cluster aggregate baseline KPI metrics."""
    return KpiService.get_cluster_kpis(db, cluster_code=cluster_code)

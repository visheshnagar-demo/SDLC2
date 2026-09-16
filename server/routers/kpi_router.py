from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import ClusterKpiResponse
from server.services.kpi_service import get_cluster_kpis

router = APIRouter(tags=["Cluster KPIs"])


@router.get("/api/v1/cluster/kpis", response_model=ClusterKpiResponse)
@router.get("/api/v1/kpis", response_model=ClusterKpiResponse)
def get_kpis_endpoint(
    cluster_id: Optional[str] = Query(
        default="STV-CLUSTER-01", description="Cluster ID or code"
    ),
    db: Session = Depends(get_db),
):
    """
    Fetch top-level cluster KPI metrics including Sales per Linear Foot,
    Private Brand %, In-Stock Rate %, and Shelf Capacity %.
    """
    return get_cluster_kpis(db=db, cluster_id_or_code=cluster_id or "STV-CLUSTER-01")

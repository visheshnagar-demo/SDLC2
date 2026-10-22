from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import DashboardMetricsResponseSchema
from server.services.dashboard_service import get_dashboard_metrics

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetricsResponseSchema)
def handle_get_metrics(db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)

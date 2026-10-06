from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import KPISummaryResponse
from server import crud

router = APIRouter(prefix="/api/v1/kpis", tags=["KPIs"])


@router.get("", response_model=KPISummaryResponse)
@router.get("/", response_model=KPISummaryResponse)
def get_kpis(db: Session = Depends(get_db)):
    """Retrieve current KPI data for the DG Cluster Assortment Advisor."""
    return crud.get_kpi_summary(db)

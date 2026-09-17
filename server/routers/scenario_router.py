from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.services.scenario_service import ScenarioService
from server.schemas.scenario import (
    ScenarioListResponse,
    ScenarioEvaluateRequest,
    ScenarioEvaluateResponse,
)

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("", response_model=ScenarioListResponse)
def get_scenarios(db: Session = Depends(get_db)):
    """Retrieve available scenario option cards (Conservative, Balanced, Aggressive) and metadata."""
    return ScenarioService.get_all_scenarios(db)


@router.post("/evaluate", response_model=ScenarioEvaluateResponse)
def evaluate_scenario(req: ScenarioEvaluateRequest, db: Session = Depends(get_db)):
    """Evaluate scenario projections, SKU action breakdowns, and guardrail compliance."""
    cluster_code = req.cluster_code or "STV-CLUSTER"
    return ScenarioService.evaluate_scenario(
        db, req.scenario_code, cluster_code=cluster_code
    )

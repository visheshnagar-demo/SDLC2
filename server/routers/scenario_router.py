from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    ScenarioListResponse,
    ScenarioEvaluateRequest,
    ScenarioEvaluateResponse,
)
from server.services.scenario_service import get_all_scenarios, evaluate_scenario_impact

router = APIRouter(tags=["Scenarios"])


@router.get("/api/v1/scenarios", response_model=ScenarioListResponse)
def get_scenarios_endpoint(db: Session = Depends(get_db)):
    """
    Retrieve scenario cards (Conservative, Balanced, Aggressive).
    """
    return get_all_scenarios(db=db)


@router.post("/api/v1/scenarios/evaluate", response_model=ScenarioEvaluateResponse)
def evaluate_scenario_endpoint(
    request: ScenarioEvaluateRequest = Body(...),
    db: Session = Depends(get_db),
):
    """
    Evaluate projected impacts and automated guardrail checks for a scenario.
    """
    return evaluate_scenario_impact(
        db=db,
        scenario_type_raw=request.scenario_type,
        cluster_id_or_code=request.cluster_id or "STV-CLUSTER-01",
    )

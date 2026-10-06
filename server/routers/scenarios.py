from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    ScenarioResponse,
    ScenarioCalculateRequest,
    ScenarioCalculateResponse,
)
from server import crud

router = APIRouter(prefix="/api/v1/scenarios", tags=["Scenarios"])


@router.get("", response_model=List[ScenarioResponse])
@router.get("/", response_model=List[ScenarioResponse])
def get_scenarios(db: Session = Depends(get_db)):
    """Retrieve predefined assortment scenarios (Conservative, Balanced, Aggressive)."""
    return crud.get_scenarios(db)


@router.post("/calculate", response_model=ScenarioCalculateResponse)
def calculate_scenario(
    request: ScenarioCalculateRequest,
    db: Session = Depends(get_db),
):
    """Calculate and return projected impact metrics and guardrail statuses for a scenario."""
    return crud.calculate_scenario_impact(
        db=db,
        scenario_type=request.scenario_type,
        current_skus=request.current_skus,
    )

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.scenario import ScenarioImpactRequest, ScenarioImpactResponse
from app.services.scenario_engine import calculate_scenario_impact

router = APIRouter()


@router.post("/scenario-impact", response_model=ScenarioImpactResponse)
def post_scenario_impact(
    payload: ScenarioImpactRequest,
    db: Session = Depends(get_db),
):
    """Calculate real-time projected impact and guardrail evaluations for a scenario strategy."""
    return calculate_scenario_impact(db, payload.scenario_key, payload.cluster_id)

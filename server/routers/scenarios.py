from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import DemoScenario, CaseDetailDTO
from server.services.fixtures import DEMO_SCENARIOS, load_scenario_into_db
from server.routers.cases import _format_case_detail

router = APIRouter(prefix="/api/v1/qtb/scenarios", tags=["Scenarios"])


@router.get("", response_model=list[DemoScenario])
def list_scenarios() -> list[DemoScenario]:
    """List all available synthetic demonstration scenarios."""
    scenarios = []
    for s in DEMO_SCENARIOS.values():
        scenarios.append(
            DemoScenario(
                scenario_id=s["scenario_id"],
                name=s["name"],
                description=s["description"],
                cedent_name=s["cedent_name"],
                line_of_business=s["line_of_business"],
                treaty_type=s["treaty_type"],
                requested_limit=s["requested_limit"],
                expected_behavior=s["expected_behavior"],
                tags=s["tags"],
            )
        )
    return scenarios


@router.post("/{scenario_id}/load", response_model=CaseDetailDTO)
def load_scenario(scenario_id: str, db: Session = Depends(get_db)) -> CaseDetailDTO:
    """Load and reset active case state to chosen scenario."""
    scenario_key = scenario_id.upper()
    if scenario_key not in DEMO_SCENARIOS:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{scenario_id}' not found. Available: {list(DEMO_SCENARIOS.keys())}",
        )

    case = load_scenario_into_db(db, scenario_key)
    return _format_case_detail(case)

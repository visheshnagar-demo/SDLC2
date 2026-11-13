from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import DemoScenario, CaseDetailDTO
from server.services.fixtures import DEMO_SCENARIOS, load_scenario_into_db
from server.routers.cases import _format_case_detail

router = APIRouter(tags=["Scenarios"])


def resolve_scenario_id(scenario_id: str) -> str:
    cleaned = scenario_id.strip().upper().replace("-", "_")
    if cleaned in DEMO_SCENARIOS:
        return cleaned
    if cleaned in (
        "A",
        "1",
        "SCENARIOA",
        "LOW_RISK",
        "LOW_RISK_RENEWAL",
        "SCENARIO_A_LOW_RISK_RENEWAL",
    ):
        return "SCENARIO_A"
    if cleaned in (
        "B",
        "2",
        "SCENARIOB",
        "INCOMPLETE",
        "INCOMPLETE_SUBMISSION",
        "SCENARIO_B_INCOMPLETE_SUBMISSION",
    ):
        return "SCENARIO_B"
    if cleaned in (
        "C",
        "3",
        "SCENARIOC",
        "HIGH_EXPOSURE",
        "HIGH_EXPOSURE_REFERRAL",
        "REFERRAL",
        "SCENARIO_C_HIGH_EXPOSURE_REFERRAL",
    ):
        return "SCENARIO_C"
    for k in DEMO_SCENARIOS:
        if k in cleaned or cleaned in k:
            return k
    return cleaned


@router.get("", response_model=list[DemoScenario])
@router.get("/", response_model=list[DemoScenario])
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


@router.get("/{scenario_id}", response_model=DemoScenario)
def get_scenario(scenario_id: str) -> DemoScenario:
    """Get details of a specific scenario."""
    scen_key = resolve_scenario_id(scenario_id)
    if scen_key not in DEMO_SCENARIOS:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{scenario_id}' not found. Available: {list(DEMO_SCENARIOS.keys())}",
        )
    s = DEMO_SCENARIOS[scen_key]
    return DemoScenario(
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


@router.post("/{scenario_id}/load", response_model=CaseDetailDTO)
@router.post("/{scenario_id}/reset", response_model=CaseDetailDTO)
@router.post("/load/{scenario_id}", response_model=CaseDetailDTO)
@router.post("/reset/{scenario_id}", response_model=CaseDetailDTO)
def load_scenario(scenario_id: str, db: Session = Depends(get_db)) -> CaseDetailDTO:
    """Load and reset active case state to chosen scenario."""
    scenario_key = resolve_scenario_id(scenario_id)
    if scenario_key not in DEMO_SCENARIOS:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{scenario_id}' not found. Available: {list(DEMO_SCENARIOS.keys())}",
        )

    case = load_scenario_into_db(db, scenario_key)
    return _format_case_detail(case)


@router.post("/load", response_model=CaseDetailDTO)
@router.post("/reset", response_model=CaseDetailDTO)
def load_scenario_from_body(
    scenario_id: str | None = Query("SCENARIO_A"),
    db: Session = Depends(get_db),
) -> CaseDetailDTO:
    """Load scenario with query parameter or default."""
    return load_scenario(scenario_id=scenario_id or "SCENARIO_A", db=db)

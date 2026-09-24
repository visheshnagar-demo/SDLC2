from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Scenario
from server.schemas import ScenarioListResponse, ScenarioResponse

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("", response_model=ScenarioListResponse)
def get_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(Scenario).all()

    # If not seeded yet, seed default scenarios on the fly
    if not scenarios:
        from server.seeds.seed_data import seed_data

        seed_data(db)
        scenarios = db.query(Scenario).all()

    items = [ScenarioResponse.from_orm(s) for s in scenarios]
    return ScenarioListResponse(scenarios=items)

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Case
from server.schemas import PricingInputDTO, PricingResultDTO
from server.services.orchestrator import MasterOrchestratorService

router = APIRouter(tags=["Pricing"])


@router.post("/calculate", response_model=PricingResultDTO)
@router.post("", response_model=PricingResultDTO)
@router.post("/", response_model=PricingResultDTO)
def calculate_pricing_standalone(
    pricing_input: PricingInputDTO = PricingInputDTO(),
    case_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> PricingResultDTO:
    """Run actuarial pricing scenario calculations."""
    target_case_id = pricing_input.case_id or case_id
    if not target_case_id:
        case = db.query(Case).first()
        target_case_id = str(case.id) if case else "default"
    return MasterOrchestratorService.calculate_pricing(
        db=db, case_id=target_case_id, pricing_input=pricing_input
    )

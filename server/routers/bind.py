from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Case
from server.schemas import BindExecutionDTO, BindConfirmationDTO, BindReadinessDTO
from server.services.orchestrator import MasterOrchestratorService

router = APIRouter(tags=["Bind"])


@router.post("", response_model=BindConfirmationDTO)
@router.post("/", response_model=BindConfirmationDTO)
@router.post("/execute", response_model=BindConfirmationDTO)
def execute_bind_standalone(
    req: BindExecutionDTO = BindExecutionDTO(),
    case_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> BindConfirmationDTO:
    """Execute final policy binding and generate contract binder certificate."""
    target_case_id = req.case_id or case_id
    if not target_case_id:
        case = db.query(Case).first()
        target_case_id = str(case.id) if case else "default"
    return MasterOrchestratorService.execute_bind(
        db=db,
        case_id=target_case_id,
        req=req,
    )


@router.get("/readiness", response_model=BindReadinessDTO)
@router.get("-readiness", response_model=BindReadinessDTO)
def get_bind_readiness_standalone(
    case_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> BindReadinessDTO:
    """Get bind readiness checklist for case."""
    target_case_id = case_id
    if not target_case_id:
        case = db.query(Case).first()
        target_case_id = str(case.id) if case else "default"
    case = MasterOrchestratorService.get_case(db, target_case_id)
    chk = case.bind_checklist
    all_cleared = bool(
        chk
        and chk.sanctions_cleared
        and chk.pricing_hurdle_cleared
        and chk.capacity_approved
        and chk.financial_rating_confirmed
        and chk.wording_approved
        and chk.hitl_signed_off
    )
    return BindReadinessDTO(
        id=chk.id if chk else "default",
        case_id=case.id,
        sanctions_cleared=chk.sanctions_cleared if chk else True,
        pricing_hurdle_cleared=chk.pricing_hurdle_cleared if chk else True,
        capacity_approved=chk.capacity_approved if chk else True,
        financial_rating_confirmed=chk.financial_rating_confirmed if chk else True,
        wording_approved=chk.wording_approved if chk else True,
        hitl_signed_off=chk.hitl_signed_off if chk else True,
        is_ready_to_bind=all_cleared,
        binder_certificate_hash=chk.binder_certificate_hash if chk else None,
        bound_at=chk.bound_at if chk else None,
        bound_by=chk.bound_by if chk else None,
    )

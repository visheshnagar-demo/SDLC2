import json
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Case, AuditLog
from server.schemas import (
    CaseDetailDTO,
    StageStatusDTO,
    StageExecutionResultDTO,
    ExecuteStageRequest,
    OverrideRequest,
    AuditLogEntryDTO,
    PricingInputDTO,
    PricingResultDTO,
    QuoteCreateDTO,
    QuoteDTO,
    ApprovalDecisionDTO,
    BindReadinessDTO,
    BindExecutionDTO,
    BindConfirmationDTO,
    PricingScenarioDTO,
)
from server.services.orchestrator import MasterOrchestratorService

router = APIRouter(prefix="/api/v1/qtb/cases", tags=["Cases"])


def _format_case_detail(case: Case) -> CaseDetailDTO:
    bind_dto = None
    if case.bind_checklist:
        chk = case.bind_checklist
        all_cleared = (
            chk.sanctions_cleared
            and chk.pricing_hurdle_cleared
            and chk.capacity_approved
            and chk.financial_rating_confirmed
            and chk.wording_approved
            and chk.hitl_signed_off
        )
        bind_dto = BindReadinessDTO(
            id=chk.id,
            case_id=case.id,
            sanctions_cleared=chk.sanctions_cleared,
            pricing_hurdle_cleared=chk.pricing_hurdle_cleared,
            capacity_approved=chk.capacity_approved,
            financial_rating_confirmed=chk.financial_rating_confirmed,
            wording_approved=chk.wording_approved,
            hitl_signed_off=chk.hitl_signed_off,
            is_ready_to_bind=all_cleared,
            binder_certificate_hash=chk.binder_certificate_hash,
            bound_at=chk.bound_at,
            bound_by=chk.bound_by,
        )

    pricing_dtos = []
    for ps in case.pricing_scenarios:
        loss_dist = []
        if ps.loss_distribution_json:
            try:
                loss_dist = json.loads(ps.loss_distribution_json)
            except Exception:
                loss_dist = []
        pricing_dtos.append(
            PricingScenarioDTO(
                id=ps.id,
                model_name=ps.model_name,
                technical_premium=ps.technical_premium,
                recommended_rate=ps.recommended_rate,
                expected_loss=ps.expected_loss,
                combined_ratio=ps.combined_ratio,
                loss_distribution=loss_dist,
            )
        )

    return CaseDetailDTO(
        id=case.id,
        case_number=case.case_number,
        scenario_id=case.scenario_id,
        cedent_name=case.cedent_name,
        line_of_business=case.line_of_business,
        treaty_type=case.treaty_type,
        requested_limit=case.requested_limit,
        retention_amount=case.retention_amount,
        historical_loss_ratio=case.historical_loss_ratio,
        current_stage=case.current_stage,
        status=case.status,
        completeness_score=case.completeness_score,
        overall_confidence=case.overall_confidence,
        created_at=case.created_at,
        updated_at=case.updated_at,
        extracted_fields=case.extracted_fields,
        quotes=case.quotes,
        stages=case.stages,
        audit_logs=case.audit_logs,
        bind_checklist=bind_dto,
        pricing_scenarios=pricing_dtos,
    )


@router.get("", response_model=list[CaseDetailDTO])
def list_cases(db: Session = Depends(get_db)) -> list[CaseDetailDTO]:
    """Retrieve all active cases."""
    cases = db.query(Case).all()
    return [_format_case_detail(c) for c in cases]


@router.get("/{case_id}", response_model=CaseDetailDTO)
def get_case(case_id: str = Path(...), db: Session = Depends(get_db)) -> CaseDetailDTO:
    """Get current case details, stage, and artifacts."""
    case = MasterOrchestratorService.get_case(db, case_id)
    return _format_case_detail(case)


@router.get("/{case_id}/stages", response_model=list[StageStatusDTO])
def get_case_stages(
    case_id: str = Path(...), db: Session = Depends(get_db)
) -> list[StageStatusDTO]:
    """Retrieve status of all 12 workflow stages for a case."""
    case = MasterOrchestratorService.get_case(db, case_id)
    return [StageStatusDTO.model_validate(s) for s in case.stages]


@router.post(
    "/{case_id}/stages/{stage_key}/execute", response_model=StageExecutionResultDTO
)
def execute_stage(
    case_id: str = Path(...),
    stage_key: str = Path(...),
    req: ExecuteStageRequest = ...,
    db: Session = Depends(get_db),
) -> StageExecutionResultDTO:
    """Trigger simulated agent processing for a specific workflow stage."""
    res = MasterOrchestratorService.execute_stage(
        db=db,
        case_id=case_id,
        stage_key=stage_key,
        actor_persona=req.actor_persona,
        parameters=req.parameters,
    )
    return StageExecutionResultDTO(
        stage_key=res["stage_key"],
        status=res["status"],
        agent_reasoning=res["agent_reasoning"],
        confidence_score=res["confidence_score"],
        updated_case=_format_case_detail(res["updated_case"]),
    )


@router.post("/{case_id}/overrides", response_model=AuditLogEntryDTO)
def record_override(
    case_id: str = Path(...),
    req: OverrideRequest = ...,
    db: Session = Depends(get_db),
) -> AuditLogEntryDTO:
    """Record human-in-the-loop exception override."""
    audit = MasterOrchestratorService.record_override(
        db=db,
        case_id=case_id,
        stage_key=req.stage_key,
        field_name=req.field_name,
        override_value=req.override_value,
        rationale=req.rationale,
        actor_persona=req.actor_persona,
    )
    return AuditLogEntryDTO.model_validate(audit)


@router.post("/{case_id}/pricing/calculate", response_model=PricingResultDTO)
def calculate_pricing(
    case_id: str = Path(...),
    pricing_input: PricingInputDTO = ...,
    db: Session = Depends(get_db),
) -> PricingResultDTO:
    """Run actuarial pricing scenario calculations."""
    return MasterOrchestratorService.calculate_pricing(
        db=db, case_id=case_id, pricing_input=pricing_input
    )


@router.post("/{case_id}/quotes", response_model=QuoteDTO, status_code=201)
def create_quote(
    case_id: str = Path(...),
    quote_data: QuoteCreateDTO = ...,
    db: Session = Depends(get_db),
) -> QuoteDTO:
    """Create or update structured quote terms."""
    quote = MasterOrchestratorService.create_quote(
        db=db, case_id=case_id, quote_data=quote_data
    )
    return QuoteDTO.model_validate(quote)


@router.post("/{case_id}/approvals/{approval_id}")
def submit_approval(
    case_id: str = Path(...),
    approval_id: str = Path(...),
    req: ApprovalDecisionDTO = ...,
    db: Session = Depends(get_db),
) -> dict:
    """Submit human governance approval or rejection."""
    return MasterOrchestratorService.submit_approval(
        db=db,
        case_id=case_id,
        approval_id=approval_id,
        decision=req.decision,
        actor_persona=req.actor_persona,
        rationale=req.rationale,
    )


@router.get("/{case_id}/bind-readiness", response_model=BindReadinessDTO)
def get_bind_readiness(
    case_id: str = Path(...), db: Session = Depends(get_db)
) -> BindReadinessDTO:
    """Verify 6-point bind readiness checklist status."""
    case = MasterOrchestratorService.get_case(db, case_id)
    if not case.bind_checklist:
        raise HTTPException(status_code=404, detail="Bind checklist not found.")

    chk = case.bind_checklist
    all_cleared = (
        chk.sanctions_cleared
        and chk.pricing_hurdle_cleared
        and chk.capacity_approved
        and chk.financial_rating_confirmed
        and chk.wording_approved
        and chk.hitl_signed_off
    )

    return BindReadinessDTO(
        id=chk.id,
        case_id=case.id,
        sanctions_cleared=chk.sanctions_cleared,
        pricing_hurdle_cleared=chk.pricing_hurdle_cleared,
        capacity_approved=chk.capacity_approved,
        financial_rating_confirmed=chk.financial_rating_confirmed,
        wording_approved=chk.wording_approved,
        hitl_signed_off=chk.hitl_signed_off,
        is_ready_to_bind=all_cleared,
        binder_certificate_hash=chk.binder_certificate_hash,
        bound_at=chk.bound_at,
        bound_by=chk.bound_by,
    )


@router.post("/{case_id}/bind", response_model=BindConfirmationDTO)
def execute_bind(
    case_id: str = Path(...),
    req: BindExecutionDTO = ...,
    db: Session = Depends(get_db),
) -> BindConfirmationDTO:
    """Execute final policy binding and generate contract binder certificate."""
    return MasterOrchestratorService.execute_bind(
        db=db,
        case_id=case_id,
        actor_persona=req.actor_persona,
        signoff_notes=req.signoff_notes,
    )


@router.get("/{case_id}/audit-logs", response_model=list[AuditLogEntryDTO])
def get_audit_logs(
    case_id: str = Path(...),
    stage: str | None = Query(None, description="Optional stage filter"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[AuditLogEntryDTO]:
    """Fetch chronologically sorted audit trail."""
    case = MasterOrchestratorService.get_case(db, case_id)
    query = db.query(AuditLog).filter(AuditLog.case_id == case.id)
    if stage:
        query = query.filter(AuditLog.stage_key == stage)
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [AuditLogEntryDTO.model_validate(l) for l in logs]

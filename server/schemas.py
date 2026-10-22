from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ExtractedFieldDTO(BaseModel):
    id: str
    field_name: str
    extracted_value: str
    confidence_score: float
    source_document: str
    source_citation_page: int
    is_overridden: bool
    overridden_value: str | None = None

    model_config = ConfigDict(from_attributes=True)


class QuoteDTO(BaseModel):
    id: str
    option_name: str
    structure_type: str
    limit_amount: float
    retention_amount: float
    ceded_premium: float
    rate_on_line: float
    commission_rate: float
    expected_loss_ratio: float
    combined_ratio: float
    status: str
    is_selected: bool

    model_config = ConfigDict(from_attributes=True)


class StageStatusDTO(BaseModel):
    id: str
    stage_key: str
    stage_name: str
    stage_order: int
    status: str
    agent_name: str
    agent_reasoning: str
    confidence_score: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogEntryDTO(BaseModel):
    id: str
    stage_key: str
    agent_name: str
    action_type: str
    confidence_score: float | None = None
    rationale: str
    actor_persona: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class BindReadinessDTO(BaseModel):
    id: str
    case_id: str
    sanctions_cleared: bool
    pricing_hurdle_cleared: bool
    capacity_approved: bool
    financial_rating_confirmed: bool
    wording_approved: bool
    hitl_signed_off: bool
    is_ready_to_bind: bool
    binder_certificate_hash: str | None = None
    bound_at: datetime | None = None
    bound_by: str | None = None

    model_config = ConfigDict(from_attributes=True)


class PricingScenarioDTO(BaseModel):
    id: str
    model_name: str
    technical_premium: float
    recommended_rate: float
    expected_loss: float
    combined_ratio: float
    loss_distribution: list[dict] = []

    model_config = ConfigDict(from_attributes=True)


class CaseDetailDTO(BaseModel):
    id: str
    case_number: str
    scenario_id: str
    cedent_name: str
    line_of_business: str
    treaty_type: str
    requested_limit: float
    retention_amount: float
    historical_loss_ratio: float | None
    current_stage: str
    status: str
    completeness_score: float
    overall_confidence: float
    created_at: datetime
    updated_at: datetime
    extracted_fields: list[ExtractedFieldDTO] = []
    quotes: list[QuoteDTO] = []
    stages: list[StageStatusDTO] = []
    audit_logs: list[AuditLogEntryDTO] = []
    bind_checklist: BindReadinessDTO | None = None
    pricing_scenarios: list[PricingScenarioDTO] = []

    model_config = ConfigDict(from_attributes=True)


class DemoScenario(BaseModel):
    scenario_id: str
    name: str
    description: str
    cedent_name: str
    line_of_business: str
    treaty_type: str
    requested_limit: float
    expected_behavior: str
    tags: list[str]


class ExecuteStageRequest(BaseModel):
    actor_persona: str
    parameters: dict = {}


class StageExecutionResultDTO(BaseModel):
    stage_key: str
    status: str
    agent_reasoning: str
    confidence_score: float
    updated_case: CaseDetailDTO


class OverrideRequest(BaseModel):
    stage_key: str
    field_name: str | None = None
    override_value: str
    rationale: str
    actor_persona: str


class PricingInputDTO(BaseModel):
    model_name: str
    expected_loss: float
    risk_load: float
    expense_load: float
    target_combined_ratio: float


class PricingResultDTO(BaseModel):
    technical_premium: float
    recommended_rate: float
    expected_loss: float
    combined_ratio: float
    loss_distribution: list[dict]


class QuoteCreateDTO(BaseModel):
    option_name: str
    structure_type: str
    limit_amount: float
    retention_amount: float
    ceded_premium: float
    commission_rate: float
    expected_loss_ratio: float
    combined_ratio: float


class ApprovalDecisionDTO(BaseModel):
    decision: str  # APPROVED or REJECTED
    actor_persona: str
    rationale: str


class BindExecutionDTO(BaseModel):
    actor_persona: str
    signoff_notes: str


class BindConfirmationDTO(BaseModel):
    case_id: str
    case_number: str
    status: str
    binder_certificate_hash: str
    bound_at: datetime
    bound_by: str
    pas_payload: dict

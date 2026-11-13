from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


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
    structure_type: str = "Quota Share"
    limit_amount: float
    retention_amount: float = 0.0
    ceded_premium: float
    rate_on_line: float = 0.0
    commission_rate: float = 0.0
    expected_loss_ratio: float = 0.0
    combined_ratio: float = 0.0
    status: str = "DRAFT"
    is_selected: bool = False

    model_config = ConfigDict(from_attributes=True, extra="allow")


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
    sanctions_cleared: bool = True
    pricing_hurdle_cleared: bool = True
    capacity_approved: bool = True
    financial_rating_confirmed: bool = True
    wording_approved: bool = True
    hitl_signed_off: bool = True
    is_ready_to_bind: bool = True
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
    historical_loss_ratio: float | None = None
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
    tags: list[str] = []


class ExecuteStageRequest(BaseModel):
    actor_persona: str = "Reinsurance Underwriter"
    parameters: dict = Field(default_factory=dict)


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
    actor_persona: str = "Reinsurance Underwriter"


class PricingInputDTO(BaseModel):
    model_name: str | None = None
    loss_distribution_model: str | None = None
    line_of_business: str | None = None
    historical_loss_ratio: float | None = None
    requested_limit: float | None = None
    attachment_point: float | None = None
    expected_loss: float | None = None
    risk_load: float | None = None
    expense_load: float | None = None
    target_combined_ratio: float | None = None
    rate_on_line: float | None = None
    layer_structure: str | None = None
    benchmark_loss_rate: float | None = None

    model_config = ConfigDict(extra="allow")


class PricingResultDTO(BaseModel):
    technical_premium: float
    recommended_rate: float
    expected_loss: float = 0.0
    combined_ratio: float = 0.0
    loss_distribution: list[dict] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")


class QuoteCreateDTO(BaseModel):
    option_name: str
    structure_type: str | None = None
    option_type: str | None = None
    limit_amount: float = 0.0
    retention_amount: float = 0.0
    ceded_premium: float = 0.0
    commission_rate: float = 0.0
    expected_loss_ratio: float = 0.0
    combined_ratio: float = 0.0
    status: str = "DRAFT"
    is_selected: bool = False

    model_config = ConfigDict(extra="allow")


class ApprovalDecisionDTO(BaseModel):
    decision: str = "APPROVED"  # APPROVED or REJECTED
    actor_persona: str = "Reinsurance Underwriter"
    rationale: str = ""


class BindExecutionDTO(BaseModel):
    quote_id: str | None = None
    underwriter_id: str | None = None
    effective_date: str | datetime | None = None
    expiration_date: str | datetime | None = None
    binder_notes: str | None = None
    actor_persona: str | None = None
    signoff_notes: str | None = None

    model_config = ConfigDict(extra="allow")


class BindConfirmationDTO(BaseModel):
    case_id: str
    case_number: str
    status: str
    binder_certificate_hash: str
    bound_at: datetime
    bound_by: str
    pas_payload: dict = Field(default_factory=dict)

    model_config = ConfigDict(extra="allow")

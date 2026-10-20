from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


class LayerStructureSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    layer_number: int = Field(..., alias="layerNumber")
    attachment: float = Field(..., alias="attachment")
    limit: float = Field(..., alias="limit")
    genre_share_percentage: float = Field(..., alias="genreSharePercentage")


class QuoteCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    insured_name: str = Field(..., alias="insuredName")
    line_of_business: str = Field(..., alias="lineOfBusiness")
    sum_insured: float = Field(..., alias="sumInsured", gt=0)
    deductible: float = Field(0.0, alias="deductible", ge=0)
    structure_type: str = Field(..., alias="structureType")
    attachment_point: Optional[float] = Field(0.0, alias="attachmentPoint")
    target_rate: Optional[float] = Field(None, alias="targetRate")
    ceding_commission: Optional[float] = Field(None, alias="cedingCommission")


class QuoteResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    quote_number: str = Field(..., alias="quoteNumber")
    insured_name: str = Field(..., alias="insuredName")
    line_of_business: str = Field(..., alias="lineOfBusiness")
    sum_insured: float = Field(..., alias="sumInsured")
    deductible: float = Field(0.0, alias="deductible")
    structure_type: str = Field(..., alias="structureType")
    attachment_point: float = Field(0.0, alias="attachmentPoint")
    quoted_premium: float = Field(..., alias="quotedPremium")
    rate_on_line: float = Field(..., alias="rateOnLine")
    ceding_commission: float = Field(0.0, alias="cedingCommission")
    status: str = Field(..., alias="status")
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    layers: Optional[List[LayerStructureSchema]] = Field(default_factory=list, alias="layers")


class PaginatedQuotesResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    content: List[QuoteResponse]
    total_elements: int = Field(..., alias="totalElements")
    total_pages: int = Field(..., alias="totalPages")
    page_number: int = Field(..., alias="pageNumber")
    page_size: int = Field(..., alias="pageSize")


class UnderwritingDecisionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    decision: str = Field(..., alias="decision")
    underwriter_id: Optional[str] = Field("UW-4091", alias="underwriterId")
    review_notes: Optional[str] = Field(None, alias="reviewNotes")


class RiskExposureResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    quote_id: str = Field(..., alias="quoteId")
    quote_number: Optional[str] = Field(None, alias="quoteNumber")
    insured_name: Optional[str] = Field(None, alias="insuredName")
    line_of_business: Optional[str] = Field(None, alias="lineOfBusiness")
    total_exposure: float = Field(..., alias="totalExposure")
    probable_maximum_loss: float = Field(..., alias="probableMaximumLoss")
    cat_risk_score: int = Field(..., alias="catRiskScore")
    underwriting_decision: str = Field(..., alias="underwritingDecision")
    underwriter_notes: Optional[str] = Field(None, alias="underwriterNotes")
    layers: List[LayerStructureSchema] = Field(default_factory=list, alias="layers")


class BinderCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    quote_id: str = Field(..., alias="quoteId")
    effective_date: Optional[str] = Field(None, alias="effectiveDate")
    expiry_date: Optional[str] = Field(None, alias="expiryDate")
    bound_by: Optional[str] = Field("UW-4091", alias="boundBy")


class BinderResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    policy_reference_id: str = Field(..., alias="policyReferenceId")
    quote_id: str = Field(..., alias="quoteId")
    insured_name: Optional[str] = Field(None, alias="insuredName")
    line_of_business: Optional[str] = Field(None, alias="lineOfBusiness")
    effective_date: str = Field(..., alias="effectiveDate")
    expiry_date: str = Field(..., alias="expiryDate")
    bound_by: str = Field(..., alias="boundBy")
    binding_timestamp: Optional[datetime] = Field(None, alias="bindingTimestamp")
    status: str = Field(..., alias="status")
    gross_premium: Optional[float] = Field(None, alias="grossPremium")
    limit: Optional[float] = Field(None, alias="limit")
    document_summary: Dict[str, Any] = Field(default_factory=dict, alias="documentSummary")

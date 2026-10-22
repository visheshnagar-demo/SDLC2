from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FactorScoreItemSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    factorCategory: str
    factorName: str
    pointsEarned: int
    maxPoints: int
    evaluationNotes: str | None = None


class DocumentUploadResponseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    submissionId: str
    documentType: str
    fileName: str
    storageUrl: str
    mimeType: str | None = None
    fileSizeBytes: int | None = None
    createdAt: datetime


class CreateSubmissionRequestSchema(BaseModel):
    cedingCompanyName: str = Field(..., min_length=1)
    insuredName: str = Field(..., min_length=1)
    lineOfBusiness: str = Field(..., min_length=1)
    policyLimit: float = Field(..., gt=0)
    attachmentPoint: float = Field(..., ge=0)
    retention: float = Field(..., ge=0)
    grossPremium: float = Field(..., gt=0)
    effectiveDate: date
    expiryDate: date
    industry: str = Field(..., min_length=1)
    revenueBand: str = Field(..., min_length=1)
    jurisdiction: str = Field(..., min_length=1)
    riskAttributes: dict[str, Any] | None = None

    @field_validator("expiryDate")
    @classmethod
    def validate_dates(cls, v: date, info) -> date:
        eff = info.data.get("effectiveDate")
        if eff and v <= eff:
            raise ValueError("effectiveDate must be strictly before expiryDate")
        return v

    @field_validator("policyLimit")
    @classmethod
    def validate_limit_vs_attachment(cls, v: float, info) -> float:
        att = info.data.get("attachmentPoint")
        if att is not None and v <= att:
            raise ValueError(
                "policyLimit must be strictly greater than attachmentPoint"
            )
        return v


class RiskScoreResponseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    submissionId: str
    compositeScore: int
    riskTier: str
    factorBreakdown: list[FactorScoreItemSchema]
    calculatedAt: datetime


class SubmissionResponseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    cedingCompanyName: str
    insuredName: str
    lineOfBusiness: str
    policyLimit: float
    attachmentPoint: float
    retention: float
    grossPremium: float
    effectiveDate: date
    expiryDate: date
    industry: str
    revenueBand: str
    jurisdiction: str
    status: str
    riskScore: int | None = None
    riskTier: str | None = None
    isReferred: bool = False
    assignedUnderwriterId: str | None = None
    createdBy: str
    createdAt: datetime
    updatedAt: datetime
    riskAttributes: dict[str, Any] | None = None
    factorBreakdown: list[FactorScoreItemSchema] = []
    documents: list[DocumentUploadResponseSchema] = []
    slaIndicator: str = "GREEN"
    ageHours: int = 0


class CreateQuoteRequestSchema(BaseModel):
    shareOfferedPercentage: float = Field(..., gt=0, le=100)
    cedingCommissionPercentage: float = Field(..., ge=0, le=100)
    calculatedReinsurancePremium: float | None = None
    subjectivities: str | None = None
    conditions: str | None = None
    exclusions: str | None = None


class QuoteResponseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    submissionId: str
    shareOfferedPercentage: float
    cedingCommissionPercentage: float
    calculatedReinsurancePremium: float
    netReinsurancePremium: float
    cedingCommissionAmount: float
    subjectivities: str | None = None
    conditions: str | None = None
    exclusions: str | None = None
    status: str
    createdBy: str | None = None
    createdAt: datetime


class SubmissionDecisionRequestSchema(BaseModel):
    targetStatus: str
    declineReason: str | None = None
    underwriterNotes: str | None = None


class ReferralDecisionRequestSchema(BaseModel):
    decision: str
    managerNotes: str | None = None


class AuditLogResponseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    submissionId: str
    actionType: str
    userId: str
    userRole: str | None = None
    changeSummary: str | None = None
    previousState: str | None = None
    newState: str | None = None
    timestamp: datetime


class DashboardMetricsResponseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    totalSubmissions: int
    submissionsByLine: dict[str, int]
    submissionsByStatus: dict[str, int]
    quoteToBindRatioPercentage: float
    averageTurnaroundHours: float
    totalExposedLimitByLine: dict[str, float]
    pendingReferralCount: int
    generatedAt: datetime


class AuthorityLimitSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    roleName: str
    maxPolicyLimit: float

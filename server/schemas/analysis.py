from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AnalysisTriggerRequest(BaseModel):
    document_id: str


class ClauseEvaluationBase(BaseModel):
    clause_title: str
    clause_text: str
    is_standard: bool = True
    risk_severity: str = "LOW"
    deviation_analysis: Optional[str] = None
    recommended_action: Optional[str] = None


class ClauseEvaluationCreate(ClauseEvaluationBase):
    analysis_job_id: str


class ClauseEvaluationResponse(ClauseEvaluationBase):
    id: str
    analysis_job_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalysisJobResponse(BaseModel):
    id: str
    document_id: str
    status: str
    composite_risk_score: Optional[float] = None
    risk_tier: Optional[str] = None
    summary: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalysisDetailResponse(AnalysisJobResponse):
    clause_evaluations: List[ClauseEvaluationResponse] = []
    document: Optional[Dict[str, Any]] = None

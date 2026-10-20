from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.analysis import (
    AnalysisTriggerRequest,
    AnalysisJobResponse,
    AnalysisDetailResponse,
    ClauseEvaluationResponse,
)
from server.services.orchestrator_service import OrchestratorService

router = APIRouter(prefix="/api/v1/analysis", tags=["Analysis"])


@router.post(
    "/trigger",
    response_model=AnalysisJobResponse,
    status_code=status.HTTP_201_CREATED,
)
def trigger_analysis(
    payload: AnalysisTriggerRequest,
    db: Session = Depends(get_db),
):
    try:
        job = OrchestratorService.trigger_analysis(
            db=db, document_id=payload.document_id
        )
        return job
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis orchestration failed: {str(e)}",
        )


@router.get("/{job_id}", response_model=AnalysisDetailResponse)
def get_analysis_detail(job_id: str, db: Session = Depends(get_db)):
    job = OrchestratorService.get_analysis(db=db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job with ID {job_id} not found",
        )

    clauses = OrchestratorService.get_clauses(db=db, job_id=job_id)
    doc_meta = None
    if job.document:
        doc_meta = {
            "id": job.document.id,
            "file_name": job.document.file_name,
            "file_type": job.document.file_type,
            "status": job.document.status,
            "extracted_metadata": job.document.extracted_metadata,
        }

    return AnalysisDetailResponse(
        id=job.id,
        document_id=job.document_id,
        status=job.status,
        composite_risk_score=job.composite_risk_score,
        risk_tier=job.risk_tier,
        summary=job.summary,
        error_message=job.error_message,
        created_at=job.created_at,
        updated_at=job.updated_at,
        clause_evaluations=clauses,
        document=doc_meta,
    )


@router.get("/{job_id}/clauses", response_model=List[ClauseEvaluationResponse])
def get_job_clauses(
    job_id: str,
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    job = OrchestratorService.get_analysis(db=db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job with ID {job_id} not found",
        )

    clauses = OrchestratorService.get_clauses(db=db, job_id=job_id, severity=severity)
    return clauses

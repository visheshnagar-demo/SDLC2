from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.routers.auth_router import get_current_user
from server.schemas.decision import DecisionCreate, DecisionResponse
from server.schemas.underwriting import (
    DeclineReason,
    LockRequest,
    LockResponse,
    SubmissionDetailResponse,
    QueueItemResponse,
    AuditLogResponse,
)
from server.schemas.submission import (
    SubmissionResponse,
    AttachmentResponse,
    RiskScoreRuleResponse,
    MissingFlagResponse,
)
from server.services.underwriting_service import (
    get_underwriting_queue,
    get_submission_audit_logs,
    set_review_lock,
    record_underwriting_decision,
    get_decline_reasons,
)
from server.services.submission_service import get_submission_by_id

router = APIRouter(prefix="/underwriting", tags=["Underwriting Workbench"])


@router.get("/reasons", response_model=List[DeclineReason])
def list_decline_reasons():
    """Returns standardized decline reason codes."""
    return get_decline_reasons()


@router.get("/decline-reasons", response_model=List[DeclineReason])
def list_decline_reasons_alias():
    """Alias for decline reasons."""
    return get_decline_reasons()


@router.get("/queue", response_model=List[QueueItemResponse])
def get_review_queue(
    risk_type: Optional[str] = Query(None, description="Filter by CYBER or D_AND_O"),
    risk_tier: Optional[str] = Query(None, description="Filter by LOW, MEDIUM, HIGH"),
    queue_status: Optional[str] = Query(
        None, alias="status", description="Filter by submission status"
    ),
    search: Optional[str] = Query(
        None, description="Search by insured name or submission reference"
    ),
    sort_by: Optional[str] = Query(
        "risk_score_desc",
        description="Sorting field: risk_score_desc, risk_score_asc, created_at_desc, sum_insured_desc",
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves the filterable, prioritized Underwriter Review Queue.
    """
    submissions = get_underwriting_queue(
        db=db,
        risk_type=risk_type,
        risk_tier=risk_tier,
        status=queue_status,
        search=search,
        sort_by=sort_by,
        skip=skip,
        limit=limit,
    )

    items = []
    for sub in submissions:
        unresolved_flags = sum(1 for f in sub.missing_flags if not f.is_resolved)
        items.append(
            QueueItemResponse(
                id=sub.id,
                submission_reference=sub.submission_reference,
                carrier_id=sub.carrier_id,
                carrier_name=sub.carrier_name,
                insured_name=sub.insured_name,
                industry_segment=sub.industry_segment,
                risk_type=sub.risk_type,
                sum_insured=float(sub.sum_insured),
                attachment_point=float(sub.attachment_point),
                risk_score=float(sub.risk_score),
                risk_tier=sub.risk_tier,
                status=sub.status,
                missing_flags_count=unresolved_flags,
                active_lock_user_id=sub.active_lock_user_id,
                active_lock_user_name=sub.active_lock_user_name,
                created_at=sub.created_at,
                updated_at=sub.updated_at,
            )
        )
    return items


@router.get("/submissions/{submission_id}", response_model=SubmissionDetailResponse)
def get_underwriting_submission_detail(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves comprehensive review dossier: risk payload, algorithmic score breakdown,
    missing information flags, decision history, and immutable audit logs.
    """
    submission = get_submission_by_id(db, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found",
        )

    audit_logs = get_submission_audit_logs(db, submission_id)

    return SubmissionDetailResponse(
        submission=SubmissionResponse.model_validate(submission),
        attachments=[
            AttachmentResponse.model_validate(a) for a in submission.attachments
        ],
        risk_score_breakdown=[
            RiskScoreRuleResponse.model_validate(r)
            for r in submission.risk_score_breakdowns
        ],
        missing_flags=[
            MissingFlagResponse.model_validate(f) for f in submission.missing_flags
        ],
        decisions=[DecisionResponse.model_validate(d) for d in submission.decisions],
        audit_logs=[AuditLogResponse.model_validate(log) for log in audit_logs],
    )


@router.post("/submissions/{submission_id}/lock", response_model=LockResponse)
def handle_review_lock(
    submission_id: str,
    payload: LockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Acquires or releases underwriter concurrency lock on a submission.
    """
    try:
        user_id = current_user.id if current_user else "underwriter-default"
        user_name = (
            current_user.full_name or current_user.email
            if current_user
            else "Senior Underwriter"
        )
        is_locked, locked_id, locked_name, locked_at, message = set_review_lock(
            db=db,
            submission_id=submission_id,
            action=payload.action,
            user_id=user_id,
            user_name=user_name,
        )
        db.commit()
        return LockResponse(
            submission_id=submission_id,
            is_locked=is_locked,
            locked_by_user_id=locked_id,
            locked_by_user_name=locked_name,
            locked_at=locked_at,
            message=message,
        )
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/submissions/{submission_id}/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_decision(
    submission_id: str,
    payload: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Records a binding Quote or standard Decline decision with audit logging.
    """
    try:
        underwriter_id = current_user.id if current_user else None
        underwriter_name = (
            current_user.full_name or current_user.email
            if current_user
            else "Senior Underwriter"
        )
        decision, _ = record_underwriting_decision(
            db=db,
            submission_id=submission_id,
            payload=payload,
            underwriter_id=underwriter_id,
            underwriter_name=underwriter_name,
        )
        db.commit()
        db.refresh(decision)
        return decision
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record decision: {str(e)}",
        )

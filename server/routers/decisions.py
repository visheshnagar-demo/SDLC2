from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.decision import (
    StatusTransitionRequest,
    ReferralDecisionRequest,
    FinalDecisionRequest,
)
from server.schemas.submission import SubmissionResponse
from server.services.workflow_service import (
    transition_submission_status,
    process_referral_decision,
    make_final_decision,
)
from server.services.submission_service import get_submission_by_id
from server.dependencies.auth import require_roles
from server.models.user import User

router = APIRouter(prefix="/api/v1/submissions", tags=["Decisions & Workflow"])


@router.patch("/{id}/status", response_model=SubmissionResponse)
def update_submission_status(
    id: str,
    req: StatusTransitionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["RE_UNDERWRITER", "UNDERWRITING_MANAGER", "SYSTEM"])
    ),
):
    sub = transition_submission_status(db, id, req, current_user)
    return get_submission_by_id(db, sub.id, current_user)


@router.post("/{id}/referral/decision", response_model=SubmissionResponse)
def decide_referral(
    id: str,
    req: ReferralDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["UNDERWRITING_MANAGER"])),
):
    sub = process_referral_decision(db, id, req, current_user)
    return get_submission_by_id(db, sub.id, current_user)


@router.post("/{id}/decisions", response_model=SubmissionResponse)
def submit_final_decision(
    id: str,
    req: FinalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["RE_UNDERWRITER", "UNDERWRITING_MANAGER"])
    ),
):
    sub = make_final_decision(db, id, req, current_user)
    return get_submission_by_id(db, sub.id, current_user)

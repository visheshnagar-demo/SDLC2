from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.approval import ApprovalRequest, ApprovalResponse
from app.services.audit_service import create_assortment_approval

router = APIRouter()


@router.post(
    "/approvals", response_model=ApprovalResponse, status_code=status.HTTP_201_CREATED
)
def submit_approval(
    payload: ApprovalRequest,
    db: Session = Depends(get_db),
):
    """Submit and lock an assortment scenario approval with immutable audit logging."""
    return create_assortment_approval(db, payload)

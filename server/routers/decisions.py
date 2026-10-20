from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.decision import (
    UnderwritingDecisionCreate,
    DecisionResponse,
)
from server.services.decision_service import DecisionService

router = APIRouter(prefix="/api/v1/decisions", tags=["Decisions"])


@router.post(
    "",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_decision(
    payload: UnderwritingDecisionCreate,
    db: Session = Depends(get_db),
):
    try:
        decision = DecisionService.record_decision(db=db, decision_data=payload)
        return decision
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record underwriting decision: {str(e)}",
        )


@router.get("", response_model=List[DecisionResponse])
def list_decisions(
    document_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return DecisionService.list_decisions(db=db, document_id=document_id)


@router.get("/{decision_id}", response_model=DecisionResponse)
def get_decision(decision_id: str, db: Session = Depends(get_db)):
    decision = DecisionService.get_decision(db=db, decision_id=decision_id)
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision with ID {decision_id} not found",
        )
    return decision

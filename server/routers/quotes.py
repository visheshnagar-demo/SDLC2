from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.quote import QuoteCreate, QuoteResponse
from server.services.quote_service import (
    create_reinsurance_quote,
    get_quotes_for_submission,
)
from server.dependencies.auth import get_current_user, require_roles
from server.models.user import User

router = APIRouter(prefix="/api/v1/submissions", tags=["Quotes"])


@router.post(
    "/{id}/quotes", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED
)
def create_quote(
    id: str,
    quote_in: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["RE_UNDERWRITER", "UNDERWRITING_MANAGER"])
    ),
):
    return create_reinsurance_quote(db, id, quote_in, current_user)


@router.get("/{id}/quotes", response_model=List[QuoteResponse])
def list_quotes(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_quotes_for_submission(db, id)

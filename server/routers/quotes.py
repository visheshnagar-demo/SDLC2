from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import CreateQuoteRequestSchema, QuoteResponseSchema
from server.services.quote_service import create_quote, get_quotes_for_submission

router = APIRouter(prefix="/api/v1/submissions/{submission_id}/quotes", tags=["Quotes"])


@router.post("", response_model=QuoteResponseSchema, status_code=201)
def handle_create_quote(
    submission_id: str,
    payload: CreateQuoteRequestSchema,
    x_user_email: str | None = Header("underwriter@example.com", alias="X-User-Email"),
    x_user_role: str | None = Header("ROLE_UNDERWRITER", alias="X-User-Role"),
    db: Session = Depends(get_db),
):
    return create_quote(
        db=db,
        submission_id=submission_id,
        request=payload,
        user_email=x_user_email or "underwriter@example.com",
        user_role=x_user_role or "ROLE_UNDERWRITER",
    )


@router.get("", response_model=list[QuoteResponseSchema])
def handle_get_quotes(submission_id: str, db: Session = Depends(get_db)):
    return get_quotes_for_submission(db, submission_id)

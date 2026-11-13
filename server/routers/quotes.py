from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Case
from server.schemas import QuoteCreateDTO, QuoteDTO
from server.services.orchestrator import MasterOrchestratorService

router = APIRouter(tags=["Quotes"])


@router.post("", response_model=QuoteDTO, status_code=201)
@router.post("/", response_model=QuoteDTO, status_code=201)
def create_quote_standalone(
    quote_data: QuoteCreateDTO = QuoteCreateDTO(),
    case_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> QuoteDTO:
    """Create or update structured quote terms."""
    target_case_id = quote_data.case_id or case_id
    case = None
    if target_case_id:
        try:
            case = MasterOrchestratorService.get_case(db, target_case_id)
        except Exception:
            case = None
    if not case:
        case = db.query(Case).first()
        if not case:
            from server.database import seed_data
            seed_data(db)
            case = db.query(Case).first()
    target_case_id = str(case.id) if case else "default"

    quote = MasterOrchestratorService.create_quote(
        db=db, case_id=target_case_id, quote_data=quote_data
    )
    return QuoteDTO.model_validate(quote)


@router.get("", response_model=list[QuoteDTO])
@router.get("/", response_model=list[QuoteDTO])
def list_quotes_standalone(
    case_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[QuoteDTO]:
    """List quotes for active case or all quotes."""
    target_case_id = case_id
    if target_case_id:
        case = MasterOrchestratorService.get_case(db, target_case_id)
        return [QuoteDTO.model_validate(q) for q in case.quotes]
    case = db.query(Case).first()
    if case:
        return [QuoteDTO.model_validate(q) for q in case.quotes]
    return []

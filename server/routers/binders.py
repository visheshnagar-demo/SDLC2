import uuid
from datetime import datetime, timezone, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import PolicyBinder, Quote
from server.schemas import BinderCreate, BinderResponse

router = APIRouter(prefix="/api/v1/binders", tags=["binders"])


def binder_to_response(binder: PolicyBinder, db: Session) -> BinderResponse:
    quote = db.query(Quote).filter(Quote.id == binder.quote_id).first()
    return BinderResponse(
        id=binder.id,
        policyReferenceId=binder.policy_reference_id,
        quoteId=binder.quote_id,
        insuredName=quote.insured_name if quote else None,
        lineOfBusiness=quote.line_of_business if quote else None,
        effectiveDate=binder.effective_date,
        expiryDate=binder.expiry_date,
        boundBy=binder.bound_by,
        bindingTimestamp=binder.binding_timestamp,
        status=binder.status,
        grossPremium=quote.quoted_premium if quote else None,
        limit=quote.sum_insured if quote else None,
        documentSummary=binder.document_summary or {},
    )


@router.get("", response_model=List[BinderResponse])
def get_binders(db: Session = Depends(get_db)):
    binders = db.query(PolicyBinder).order_by(PolicyBinder.binding_timestamp.desc()).all()
    return [binder_to_response(b, db) for b in binders]


@router.get("/{id}", response_model=BinderResponse)
def get_binder_by_id(id: str, db: Session = Depends(get_db)):
    binder = db.query(PolicyBinder).filter(PolicyBinder.id == id).first()
    if not binder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Policy binder not found with ID: {id}")
    return binder_to_response(binder, db)


@router.post("", response_model=BinderResponse, status_code=status.HTTP_201_CREATED)
def create_binder(payload: BinderCreate, db: Session = Depends(get_db)):
    quote = db.query(Quote).filter(Quote.id == payload.quote_id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quote not found for ID: {payload.quote_id}")

    binder_count = db.query(PolicyBinder).count()
    policy_ref_id = f"GENRE-QTB-2026-{88412 + binder_count:05d}"

    today = date.today().isoformat()
    next_year = date.today().replace(year=date.today().year + 1).isoformat()

    doc_summary = {
        "binderTitle": "Gen Re Treaty Reinsurance Binder Certificate",
        "jurisdiction": "State of New York, USA",
        "securityRating": "S&P AA+ / A.M. Best A++",
        "specialConditions": [
            "Quarterly loss bordereau reporting required within 30 days of quarter close.",
            "Sanctions limitation and exclusion clause LMA3100 applies.",
            "Premium installment schedule: 4 equal quarterly payments.",
        ],
    }

    binder = PolicyBinder(
        id=str(uuid.uuid4()),
        policy_reference_id=policy_ref_id,
        quote_id=quote.id,
        effective_date=payload.effective_date or today,
        expiry_date=payload.expiry_date or next_year,
        bound_by=payload.bound_by or "UW-4091",
        binding_timestamp=datetime.now(timezone.utc),
        status="BOUND",
        document_summary=doc_summary,
    )
    db.add(binder)

    quote.status = "BOUND"
    quote.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(binder)

    return binder_to_response(binder, db)

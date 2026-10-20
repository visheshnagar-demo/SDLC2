import uuid
from math import ceil
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Quote, RiskExposure
from server.schemas import QuoteCreate, QuoteResponse, PaginatedQuotesResponse, LayerStructureSchema
from server.services.pricing import (
    calculate_rate_on_line,
    calculate_ceding_commission,
    calculate_quoted_premium,
    generate_synthetic_layers,
)

router = APIRouter(prefix="/api/v1/quotes", tags=["quotes"])


def quote_to_response(quote: Quote, db: Session) -> QuoteResponse:
    risk = db.query(RiskExposure).filter(RiskExposure.quote_id == quote.id).first()
    layers = []
    if risk and risk.layers:
        for l in risk.layers:
            layers.append(
                LayerStructureSchema(
                    layerNumber=l.get("layerNumber", 1),
                    attachment=float(l.get("attachment", 0.0)),
                    limit=float(l.get("limit", 0.0)),
                    genreSharePercentage=float(l.get("genreSharePercentage", 0.0)),
                )
            )

    return QuoteResponse(
        id=quote.id,
        quoteNumber=quote.quote_number,
        insuredName=quote.insured_name,
        lineOfBusiness=quote.line_of_business,
        sumInsured=quote.sum_insured,
        deductible=quote.deductible,
        structureType=quote.structure_type,
        attachmentPoint=quote.attachment_point,
        quotedPremium=quote.quoted_premium,
        rateOnLine=quote.rate_on_line,
        cedingCommission=quote.ceding_commission,
        status=quote.status,
        createdAt=quote.created_at,
        updatedAt=quote.updated_at,
        layers=layers,
    )


@router.get("", response_model=PaginatedQuotesResponse)
def get_quotes(
    status_filter: Optional[str] = Query(None, alias="status"),
    line_of_business: Optional[str] = Query(None, alias="lineOfBusiness"),
    page: int = Query(0, ge=0),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Quote)
    if status_filter:
        query = query.filter(Quote.status.ilike(status_filter.strip()))
    if line_of_business:
        query = query.filter(Quote.line_of_business.ilike(line_of_business.strip()))

    query = query.order_by(Quote.created_at.desc())
    total_elements = query.count()
    total_pages = ceil(total_elements / size) if total_elements > 0 else 0

    quotes = query.offset(page * size).limit(size).all()
    content = [quote_to_response(q, db) for q in quotes]

    return PaginatedQuotesResponse(
        content=content,
        totalElements=total_elements,
        totalPages=total_pages,
        pageNumber=page,
        pageSize=size,
    )


@router.get("/{id}", response_model=QuoteResponse)
def get_quote_by_id(id: str, db: Session = Depends(get_db)):
    quote = db.query(Quote).filter(Quote.id == id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quote not found with ID: {id}")
    return quote_to_response(quote, db)


@router.post("", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def create_quote(payload: QuoteCreate, db: Session = Depends(get_db)):
    quote_count = db.query(Quote).count()
    quote_number = f"QTB-2026-{101 + quote_count:05d}"

    rol = calculate_rate_on_line(payload.line_of_business, payload.structure_type, payload.target_rate)
    premium = calculate_quoted_premium(payload.sum_insured, rol)
    commission = calculate_ceding_commission(payload.line_of_business, payload.ceding_commission)

    quote_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    quote = Quote(
        id=quote_id,
        quote_number=quote_number,
        insured_name=payload.insured_name,
        line_of_business=payload.line_of_business,
        sum_insured=payload.sum_insured,
        deductible=payload.deductible or 0.0,
        structure_type=payload.structure_type,
        attachment_point=payload.attachment_point or 0.0,
        quoted_premium=premium,
        rate_on_line=rol,
        ceding_commission=commission,
        status="QUOTED",
        created_at=now,
        updated_at=now,
    )
    db.add(quote)

    # Generate synthetic risk exposure & layers
    layers_data = generate_synthetic_layers(payload.sum_insured, payload.attachment_point or 0.0, payload.structure_type)
    pml = round(payload.sum_insured * 0.35, 2)
    risk = RiskExposure(
        id=str(uuid.uuid4()),
        quote_id=quote_id,
        total_exposure=payload.sum_insured,
        probable_maximum_loss=pml,
        cat_risk_score=38,
        underwriting_decision="PENDING",
        underwriter_notes="Synthetic quotation generated. Ready for underwriter exposure review.",
        layers=layers_data,
    )
    db.add(risk)
    db.commit()
    db.refresh(quote)

    return quote_to_response(quote, db)

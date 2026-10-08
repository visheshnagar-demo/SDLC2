import uuid
from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from server.database import get_db
from server.models import Quote, QuoteFactor
from server.schemas import (
    QuoteCalculateRequest,
    QuoteResponse,
    QuoteListResponse,
    QuoteStatsResponse,
    FactorBreakdownItem,
)
from server.rating_engine import calculate_motor_premium

router = APIRouter(prefix="/quotes", tags=["Quotes"])


def _to_quote_response(quote: Quote) -> QuoteResponse:
    factor_items = [
        FactorBreakdownItem(
            id=f.id,
            factor_name=f.factor_name,
            amount=f.amount,
            category=f.category,
            description=f.description,
        )
        for f in quote.factors
    ]
    return QuoteResponse(
        id=quote.id,
        quote_id=quote.id,
        vehicle_make=quote.vehicle_make,
        vehicle_year=quote.vehicle_year,
        vehicle_value=quote.vehicle_value,
        driver_age=quote.driver_age,
        driving_experience=quote.driving_experience,
        coverage_type=quote.coverage_type,
        base_premium=quote.base_premium,
        total_premium=quote.total_premium,
        currency=quote.currency,
        status=quote.status,
        calculated_at=quote.created_at,
        created_at=quote.created_at,
        breakdown=factor_items,
        factors=factor_items,
    )


@router.post("/calculate", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def calculate_quote(
    payload: QuoteCalculateRequest,
    db: Session = Depends(get_db)
):
    """
    Calculate motor insurance premium with itemized factor breakdown and audit logging.
    """
    rating_result = calculate_motor_premium(
        vehicle_make=payload.vehicle_make,
        vehicle_year=payload.vehicle_year,
        vehicle_value=payload.vehicle_value,
        driver_age=payload.driver_age,
        driving_experience=payload.driving_experience,
        coverage_type=payload.coverage_type,
    )

    quote_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    db_quote = Quote(
        id=quote_id,
        vehicle_make=payload.vehicle_make,
        vehicle_year=payload.vehicle_year,
        vehicle_value=payload.vehicle_value,
        driver_age=payload.driver_age,
        driving_experience=payload.driving_experience,
        coverage_type=payload.coverage_type,
        base_premium=rating_result["base_premium"],
        total_premium=rating_result["total_premium"],
        currency="USD",
        status="Calculated",
        created_at=now,
        updated_at=now,
    )
    db.add(db_quote)

    for factor_data in rating_result["breakdown"]:
        db_factor = QuoteFactor(
            id=str(uuid.uuid4()),
            quote_id=quote_id,
            factor_name=factor_data["factor_name"],
            amount=factor_data["amount"],
            category=factor_data["category"],
            description=factor_data["description"],
            created_at=now,
        )
        db.add(db_factor)

    db.commit()
    db.refresh(db_quote)

    return _to_quote_response(db_quote)


@router.get("", response_model=QuoteListResponse)
def list_quotes(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Limit for pagination"),
    db: Session = Depends(get_db)
):
    """
    Retrieve paginated quote calculation history and audit trail.
    """
    total = db.query(Quote).count()
    quotes = (
        db.query(Quote)
        .order_by(Quote.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    items = [_to_quote_response(q) for q in quotes]
    return QuoteListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/stats", response_model=QuoteStatsResponse)
def get_quote_stats(db: Session = Depends(get_db)):
    """
    Retrieve KPI statistics for quotes.
    """
    total_quotes = db.query(Quote).count()
    
    # Calculate average quote value
    avg_result = db.query(func.avg(Quote.total_premium)).scalar()
    avg_quote_value = round(float(avg_result), 2) if avg_result is not None else 0.0

    # Quotes today
    today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
    quotes_today = db.query(Quote).filter(Quote.created_at >= today_start).count()

    # Bound conversion rate
    bound_count = db.query(Quote).filter(Quote.status == "Bound").count()
    conversion_rate = round((bound_count / total_quotes) * 100, 1) if total_quotes > 0 else 0.0

    return QuoteStatsResponse(
        total_quotes=total_quotes,
        quotes_today=quotes_today,
        avg_quote_value=avg_quote_value,
        conversion_rate=conversion_rate,
    )


@router.get("/{quote_id}", response_model=QuoteResponse)
def get_quote_by_id(quote_id: str, db: Session = Depends(get_db)):
    """
    Retrieve single quote calculation details and itemized factors by quote ID.
    """
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote with ID '{quote_id}' not found"
        )
    return _to_quote_response(quote)


@router.post("/{quote_id}/bind", response_model=QuoteResponse)
def bind_quote(quote_id: str, db: Session = Depends(get_db)):
    """
    Mark a calculated quote as Bound policy.
    """
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote with ID '{quote_id}' not found"
        )
    quote.status = "Bound"
    quote.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(quote)
    return _to_quote_response(quote)

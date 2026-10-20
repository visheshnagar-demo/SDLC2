from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import RiskExposure, Quote
from server.schemas import RiskExposureResponse, UnderwritingDecisionRequest, LayerStructureSchema

router = APIRouter(prefix="/api/v1/risks", tags=["risks"])


def risk_to_response(risk: RiskExposure, db: Session) -> RiskExposureResponse:
    quote = db.query(Quote).filter(Quote.id == risk.quote_id).first()
    layers = []
    if risk.layers:
        for l in risk.layers:
            layers.append(
                LayerStructureSchema(
                    layerNumber=l.get("layerNumber", 1),
                    attachment=float(l.get("attachment", 0.0)),
                    limit=float(l.get("limit", 0.0)),
                    genreSharePercentage=float(l.get("genreSharePercentage", 0.0)),
                )
            )

    return RiskExposureResponse(
        id=risk.id,
        quoteId=risk.quote_id,
        quoteNumber=quote.quote_number if quote else None,
        insuredName=quote.insured_name if quote else None,
        lineOfBusiness=quote.line_of_business if quote else None,
        totalExposure=risk.total_exposure,
        probableMaximumLoss=risk.probable_maximum_loss,
        catRiskScore=risk.cat_risk_score,
        underwritingDecision=risk.underwriting_decision,
        underwriterNotes=risk.underwriter_notes,
        layers=layers,
    )


@router.get("", response_model=List[RiskExposureResponse])
def get_risks(db: Session = Depends(get_db)):
    risks = db.query(RiskExposure).all()
    return [risk_to_response(r, db) for r in risks]


@router.get("/{id}", response_model=RiskExposureResponse)
def get_risk_by_id(id: str, db: Session = Depends(get_db)):
    risk = db.query(RiskExposure).filter(RiskExposure.id == id).first()
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Risk exposure profile not found with ID: {id}")
    return risk_to_response(risk, db)


@router.patch("/{id}/decision", response_model=RiskExposureResponse)
def update_risk_decision(id: str, payload: UnderwritingDecisionRequest, db: Session = Depends(get_db)):
    risk = db.query(RiskExposure).filter(RiskExposure.id == id).first()
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Risk exposure profile not found with ID: {id}")

    decision = payload.decision.upper().strip()
    risk.underwriting_decision = decision
    if payload.review_notes:
        risk.underwriter_notes = payload.review_notes

    quote = db.query(Quote).filter(Quote.id == risk.quote_id).first()
    if quote:
        if decision == "APPROVED":
            quote.status = "APPROVED"
        elif decision == "DECLINED":
            quote.status = "DECLINED"
        elif decision == "REFERRED":
            quote.status = "REFERRED"
        quote.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(risk)

    return risk_to_response(risk, db)

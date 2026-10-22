import uuid
from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from server.models import Quote, Submission
from server.schemas import CreateQuoteRequestSchema, QuoteResponseSchema
from server.services.audit_service import record_audit_log


def create_quote(
    db: Session,
    submission_id: str,
    request: CreateQuoteRequestSchema,
    user_email: str = "underwriter@example.com",
    user_role: str = "ROLE_UNDERWRITER",
) -> QuoteResponseSchema:
    submission = db.query(Submission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=404, detail=f"Submission {submission_id} not found"
        )

    share_pct = request.shareOfferedPercentage
    comm_pct = request.cedingCommissionPercentage
    gross_prem = submission.gross_premium

    if (
        request.calculatedReinsurancePremium
        and request.calculatedReinsurancePremium > 0
    ):
        calc_prem = round(request.calculatedReinsurancePremium, 2)
    else:
        calc_prem = round(gross_prem * (share_pct / 100.0), 2)

    comm_amt = round(calc_prem * (comm_pct / 100.0), 2)
    net_prem = round(calc_prem - comm_amt, 2)

    quote = Quote(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        share_offered_percentage=share_pct,
        ceding_commission_percentage=comm_pct,
        calculated_reinsurance_premium=calc_prem,
        net_reinsurance_premium=net_prem,
        ceding_commission_amount=comm_amt,
        subjectivities=request.subjectivities,
        conditions=request.conditions,
        exclusions=request.exclusions,
        status="ISSUED",
        created_by=user_email,
        created_at=datetime.now(UTC),
    )

    db.add(quote)

    if submission.status in ("RECEIVED", "IN_REVIEW"):
        submission.status = "QUOTED"
        submission.updated_at = datetime.now(UTC)

    db.commit()
    db.refresh(quote)

    record_audit_log(
        db=db,
        submission_id=submission.id,
        action_type="QUOTE_CREATED",
        user_id=user_email,
        user_role=user_role,
        change_summary=f"Issued Quote: {share_pct}% share, {comm_pct}% commission, Net Premium ${net_prem:,.2f}",
        previous_state=None,
        new_state="ISSUED",
    )

    return QuoteResponseSchema(
        id=quote.id,
        submissionId=quote.submission_id,
        shareOfferedPercentage=quote.share_offered_percentage,
        cedingCommissionPercentage=quote.ceding_commission_percentage,
        calculatedReinsurancePremium=quote.calculated_reinsurance_premium,
        netReinsurancePremium=quote.net_reinsurance_premium,
        cedingCommissionAmount=quote.ceding_commission_amount,
        subjectivities=quote.subjectivities,
        conditions=quote.conditions,
        exclusions=quote.exclusions,
        status=quote.status,
        createdBy=quote.created_by,
        createdAt=quote.created_at,
    )


def get_quotes_for_submission(
    db: Session, submission_id: str
) -> list[QuoteResponseSchema]:
    quotes = (
        db.query(Quote)
        .filter_by(submission_id=submission_id)
        .order_by(Quote.created_at.desc())
        .all()
    )
    return [
        QuoteResponseSchema(
            id=q.id,
            submissionId=q.submission_id,
            shareOfferedPercentage=q.share_offered_percentage,
            cedingCommissionPercentage=q.ceding_commission_percentage,
            calculatedReinsurancePremium=q.calculated_reinsurance_premium,
            netReinsurancePremium=q.net_reinsurance_premium,
            cedingCommissionAmount=q.ceding_commission_amount,
            subjectivities=q.subjectivities,
            conditions=q.conditions,
            exclusions=q.exclusions,
            status=q.status,
            createdBy=q.created_by,
            createdAt=q.created_at,
        )
        for q in quotes
    ]

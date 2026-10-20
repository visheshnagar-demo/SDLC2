import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models.submission import Submission
from server.models.quote import Quote
from server.models.user import User
from server.schemas.quote import QuoteCreate
from server.services.audit_service import log_submission_action
from server.config import settings


def generate_quote_number(db: Session) -> str:
    while True:
        num = f"QUO-{random.randint(1000, 9999)}"
        existing = db.query(Quote).filter(Quote.quote_number == num).first()
        if not existing:
            return num


def create_reinsurance_quote(
    db: Session,
    submission_id: str,
    quote_in: QuoteCreate,
    current_user: User,
) -> Quote:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Authority check
    if current_user.role != "UNDERWRITING_MANAGER":
        uw_limit = (
            current_user.authority_limit or settings.UNDERWRITER_DEFAULT_AUTHORITY_LIMIT
        )
        if (
            submission.policy_limit > uw_limit
            and submission.referral_status != "APPROVED"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Policy limit ${submission.policy_limit:,.2f} exceeds your authority limit of ${uw_limit:,.2f}. Must obtain manager referral approval first.",
            )

    share_pct = quote_in.share_offered_pct
    comm_pct = quote_in.ceding_commission_pct
    gross_prem = quote_in.proposed_gross_premium or submission.proposed_premium

    exposed_limit = submission.policy_limit * (share_pct / 100.0)
    gross_re_prem = gross_prem * (share_pct / 100.0)
    net_re_prem = gross_re_prem * (1.0 - (comm_pct / 100.0))

    valid_until_date = quote_in.valid_until or (
        datetime.now(timezone.utc).date() + timedelta(days=30)
    )

    quote = Quote(
        id=str(uuid.uuid4()),
        quote_number=generate_quote_number(db),
        submission_id=submission.id,
        created_by_user_id=current_user.id,
        share_offered_pct=share_pct,
        reinsurance_exposed_limit=exposed_limit,
        ceding_commission_pct=comm_pct,
        proposed_gross_premium=gross_prem,
        gross_reinsurance_premium=gross_re_prem,
        reinsurance_premium=net_re_prem,
        conditions=quote_in.conditions,
        exclusions=quote_in.exclusions,
        status="ISSUED",
        valid_until=valid_until_date,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(quote)

    prev_status = submission.status
    submission.status = "QUOTED"
    db.flush()

    log_submission_action(
        db=db,
        submission_id=submission.id,
        action_type="QUOTED",
        actor=current_user,
        previous_state={"status": prev_status},
        new_state={
            "status": "QUOTED",
            "quote_number": quote.quote_number,
            "share_offered_pct": share_pct,
            "net_reinsurance_premium": net_re_prem,
        },
        change_reason=f"Issued formal quote {quote.quote_number}",
    )

    db.commit()
    db.refresh(quote)
    return quote


def get_quotes_for_submission(
    db: Session,
    submission_id: str,
) -> List[Quote]:
    return (
        db.query(Quote)
        .filter(Quote.submission_id == submission_id)
        .order_by(Quote.created_at.desc())
        .all()
    )

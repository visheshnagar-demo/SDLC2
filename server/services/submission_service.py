import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc
from fastapi import HTTPException

from server.models.submission import Submission
from server.models.risk_score import RiskScore
from server.models.missing_info import MissingInfoFlag
from server.models.attachment import SubmissionAttachment
from server.schemas.submission import SubmissionCreate, AttachmentCreate
from server.services.scoring_service import calculate_risk_score
from server.services.validation_service import scan_missing_info


def create_submission(db: Session, sub_in: SubmissionCreate) -> Submission:
    sub_id = str(uuid.uuid4())
    
    # 1. Create Submission model
    submission = Submission(
        id=sub_id,
        carrier_id=sub_in.carrier_id,
        carrier_name=sub_in.carrier_name,
        insured_name=sub_in.insured_name,
        industry_sector=sub_in.industry_sector,
        annual_revenue=sub_in.annual_revenue,
        risk_type=sub_in.risk_type,
        requested_limit=sub_in.requested_limit,
        attachment_point=sub_in.attachment_point,
        policy_effective_date=sub_in.policy_effective_date,
        policy_expiration_date=sub_in.policy_expiration_date,
        status="SUBMITTED",
        submission_payload=sub_in.risk_parameters or {},
    )
    db.add(submission)
    db.flush()

    # 2. Add attachments if any
    attachment_names = []
    if sub_in.attachments:
        for att in sub_in.attachments:
            att_obj = SubmissionAttachment(
                id=str(uuid.uuid4()),
                submission_id=sub_id,
                document_type=att.document_type,
                file_name=att.file_name,
                file_size_bytes=att.file_size_bytes or 0,
                file_path=att.file_path,
            )
            db.add(att_obj)
            attachment_names.append(att.file_name)

    # 3. Compute Risk Score
    score_res = calculate_risk_score(
        risk_type=sub_in.risk_type,
        requested_limit=sub_in.requested_limit,
        attachment_point=sub_in.attachment_point,
        annual_revenue=sub_in.annual_revenue,
        industry_sector=sub_in.industry_sector,
        risk_parameters=sub_in.risk_parameters,
    )
    risk_score = RiskScore(
        id=str(uuid.uuid4()),
        submission_id=sub_id,
        composite_score=score_res["composite_score"],
        risk_tier=score_res["risk_tier"],
        score_breakdown=score_res["score_breakdown"],
        scoring_rules_version="v1.0",
    )
    db.add(risk_score)

    # 4. Compute Missing Info Flags
    flags = scan_missing_info(
        risk_type=sub_in.risk_type,
        submission_data=sub_in.model_dump(),
        attachments=attachment_names,
    )
    for f in flags:
        flag_obj = MissingInfoFlag(
            id=str(uuid.uuid4()),
            submission_id=sub_id,
            item_key=f["item_key"],
            item_category=f["item_category"],
            description=f["description"],
            severity=f["severity"],
            is_resolved=f.get("is_resolved", False),
        )
        db.add(flag_obj)

    db.commit()
    return get_submission(db, sub_id)


def get_submission(db: Session, submission_id: str) -> Submission:
    sub = (
        db.query(Submission)
        .options(
            joinedload(Submission.risk_score),
            joinedload(Submission.missing_info_flags),
            joinedload(Submission.attachments),
            joinedload(Submission.decisions),
        )
        .filter(Submission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail=f"Submission with id {submission_id} not found")
    return sub


def list_submissions(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    risk_type: Optional[str] = None,
    status: Optional[str] = None,
    carrier_id: Optional[str] = None,
) -> Tuple[int, List[Submission]]:
    query = db.query(Submission).options(
        joinedload(Submission.risk_score),
        joinedload(Submission.missing_info_flags),
        joinedload(Submission.attachments),
        joinedload(Submission.decisions),
    )
    if risk_type:
        query = query.filter(Submission.risk_type == risk_type.upper())
    if status:
        query = query.filter(Submission.status == status.upper())
    if carrier_id:
        query = query.filter(Submission.carrier_id == carrier_id)

    total = query.count()
    items = query.order_by(desc(Submission.created_at)).offset(skip).limit(limit).all()
    return total, items


def get_underwriter_queue(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    risk_type: Optional[str] = None,
    risk_tier: Optional[str] = None,
    status: Optional[str] = None,
    carrier_id: Optional[str] = None,
    sort_by: str = "composite_score",
    order: str = "desc",
) -> Tuple[int, List[Dict[str, Any]]]:
    query = (
        db.query(Submission)
        .outerjoin(RiskScore, Submission.id == RiskScore.submission_id)
        .options(
            joinedload(Submission.risk_score),
            joinedload(Submission.missing_info_flags),
        )
    )

    if risk_type:
        query = query.filter(Submission.risk_type == risk_type.upper())
    if risk_tier:
        query = query.filter(RiskScore.risk_tier == risk_tier.upper())
    if status:
        query = query.filter(Submission.status == status.upper())
    if carrier_id:
        query = query.filter(Submission.carrier_id == carrier_id)

    # Sorting
    is_desc = order.lower() == "desc"
    if sort_by == "composite_score":
        sort_col = RiskScore.composite_score
        query = query.order_by(desc(sort_col) if is_desc else asc(sort_col))
    elif sort_by == "requested_limit":
        sort_col = Submission.requested_limit
        query = query.order_by(desc(sort_col) if is_desc else asc(sort_col))
    elif sort_by == "created_at":
        sort_col = Submission.created_at
        query = query.order_by(desc(sort_col) if is_desc else asc(sort_col))
    else:
        query = query.order_by(desc(Submission.created_at))

    total = query.count()
    submissions = query.offset(skip).limit(limit).all()

    items = []
    for s in submissions:
        flags = s.missing_info_flags or []
        unresolved_flags = [f for f in flags if not f.is_resolved]
        blocking_flags = [f for f in unresolved_flags if f.severity == "BLOCKING"]

        items.append({
            "submission_id": s.id,
            "carrier_id": s.carrier_id,
            "carrier_name": s.carrier_name,
            "insured_name": s.insured_name,
            "industry_sector": s.industry_sector,
            "risk_type": s.risk_type,
            "requested_limit": s.requested_limit,
            "attachment_point": s.attachment_point,
            "composite_score": s.risk_score.composite_score if s.risk_score else None,
            "risk_tier": s.risk_score.risk_tier if s.risk_score else None,
            "missing_flags_count": len(unresolved_flags),
            "blocking_flags_count": len(blocking_flags),
            "status": s.status,
            "created_at": s.created_at,
        })

    return total, items


def recalculate_submission(db: Session, submission_id: str) -> Submission:
    sub = get_submission(db, submission_id)

    # Re-score
    score_res = calculate_risk_score(
        risk_type=sub.risk_type,
        requested_limit=sub.requested_limit,
        attachment_point=sub.attachment_point,
        annual_revenue=sub.annual_revenue,
        industry_sector=sub.industry_sector,
        risk_parameters=sub.submission_payload,
    )
    if sub.risk_score:
        sub.risk_score.composite_score = score_res["composite_score"]
        sub.risk_score.risk_tier = score_res["risk_tier"]
        sub.risk_score.score_breakdown = score_res["score_breakdown"]
        sub.risk_score.calculated_at = datetime.now(timezone.utc)
    else:
        new_score = RiskScore(
            id=str(uuid.uuid4()),
            submission_id=sub.id,
            composite_score=score_res["composite_score"],
            risk_tier=score_res["risk_tier"],
            score_breakdown=score_res["score_breakdown"],
            scoring_rules_version="v1.0",
        )
        db.add(new_score)

    # Re-scan flags
    attachment_names = [a.file_name for a in (sub.attachments or [])]
    flags = scan_missing_info(
        risk_type=sub.risk_type,
        submission_data={
            "carrier_id": sub.carrier_id,
            "carrier_name": sub.carrier_name,
            "insured_name": sub.insured_name,
            "industry_sector": sub.industry_sector,
            "annual_revenue": sub.annual_revenue,
            "requested_limit": sub.requested_limit,
            "attachment_point": sub.attachment_point,
            "policy_effective_date": sub.policy_effective_date,
            "policy_expiration_date": sub.policy_expiration_date,
            "risk_parameters": sub.submission_payload,
        },
        attachments=attachment_names,
    )

    # Update or add missing flags
    existing_flags_map = {f.item_key: f for f in (sub.missing_info_flags or [])}
    current_flag_keys = {f["item_key"] for f in flags}

    # Mark resolved flags that no longer appear
    for k, flag_model in existing_flags_map.items():
        if k not in current_flag_keys and not flag_model.is_resolved:
            flag_model.is_resolved = True
            flag_model.resolved_at = datetime.now(timezone.utc)

    # Add new flags
    for f in flags:
        k = f["item_key"]
        if k not in existing_flags_map:
            new_flag = MissingInfoFlag(
                id=str(uuid.uuid4()),
                submission_id=sub.id,
                item_key=f["item_key"],
                item_category=f["item_category"],
                description=f["description"],
                severity=f["severity"],
                is_resolved=f.get("is_resolved", False),
            )
            db.add(new_flag)
        else:
            # If it's already there and was marked resolved, but now is detected missing again
            pass

    db.commit()
    return get_submission(db, sub.id)


def add_attachment(db: Session, submission_id: str, attachment_in: AttachmentCreate) -> SubmissionAttachment:
    sub = get_submission(db, submission_id)
    att = SubmissionAttachment(
        id=str(uuid.uuid4()),
        submission_id=sub.id,
        document_type=attachment_in.document_type,
        file_name=attachment_in.file_name,
        file_size_bytes=attachment_in.file_size_bytes or 0,
        file_path=attachment_in.file_path,
    )
    db.add(att)
    db.commit()
    recalculate_submission(db, submission_id)
    db.refresh(att)
    return att

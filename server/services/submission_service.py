import uuid
import random
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, or_
from fastapi import HTTPException
from server.models.submission import Submission
from server.models.document import SubmissionDocument
from server.models.organization import Organization
from server.models.user import User
from server.models.scoring_config import ScoringRuleConfig
from server.schemas.submission import SubmissionCreate, SubmissionResponse
from server.schemas.document import DocumentCreate, DocumentResponse
from server.services.audit_service import log_submission_action
from server.config import settings


MANDATORY_DOCUMENTS_BY_LOB: Dict[str, List[str]] = {
    "CYBER": ["APPLICATION", "LOSS_RUNS", "SECURITY_AUDIT"],
    "DO": ["APPLICATION", "LOSS_RUNS", "AUDITED_FINANCIALS"],
    "EO": ["APPLICATION", "LOSS_RUNS"],
    "EPLI": ["APPLICATION", "LOSS_RUNS", "HR_POLICIES"],
    "MEDMAL": ["APPLICATION", "LOSS_RUNS", "CREDENTIALING_REPORT"],
}


def normalize_lob(lob: str) -> str:
    cleaned = lob.strip().upper()
    if "CYBER" in cleaned:
        return "CYBER"
    if "D&O" in cleaned or "DIRECTOR" in cleaned or cleaned == "DO":
        return "DO"
    if "E&O" in cleaned or "ERROR" in cleaned or cleaned == "EO":
        return "EO"
    if "EPLI" in cleaned or "EMPLOYMENT" in cleaned:
        return "EPLI"
    if "MED" in cleaned or "MALPRACTICE" in cleaned:
        return "MEDMAL"
    return cleaned


def generate_submission_number(db: Session) -> str:
    while True:
        num = f"SUB-{random.randint(1000, 9999)}"
        existing = (
            db.query(Submission).filter(Submission.submission_number == num).first()
        )
        if not existing:
            return num


def evaluate_document_completeness(db: Session, submission: Submission) -> str:
    lob = normalize_lob(submission.line_of_business)
    required_docs = MANDATORY_DOCUMENTS_BY_LOB.get(lob, ["APPLICATION", "LOSS_RUNS"])

    # Check custom config if exists
    config = (
        db.query(ScoringRuleConfig)
        .filter(ScoringRuleConfig.line_of_business == lob)
        .first()
    )
    if config and config.rules_json and "mandatory_documents" in config.rules_json:
        required_docs = config.rules_json["mandatory_documents"]

    uploaded_doc_types = {doc.document_type.upper() for doc in submission.documents}

    # Normalize type matching
    def is_present(req: str) -> bool:
        if req in uploaded_doc_types:
            return True
        if req == "AUDITED_FINANCIALS" and "FINANCIALS" in uploaded_doc_types:
            return True
        if req == "SECURITY_AUDIT" and (
            "CONTROLS" in uploaded_doc_types or "SECURITY" in uploaded_doc_types
        ):
            return True
        return False

    all_present = all(is_present(req) for req in required_docs)
    return "COMPLETE" if all_present else "INCOMPLETE"


def compute_sla_and_enrich(
    submission: Submission, user: Optional[User] = None
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    created_at = submission.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    elapsed_hours = (now - created_at).total_seconds() / 3600.0

    warning_threshold = settings.SLA_WARNING_HOURS
    breach_threshold = settings.SLA_BREACH_HOURS

    if elapsed_hours >= breach_threshold:
        sla_status = "BREACHED"
        hours_remaining = 0.0
    elif elapsed_hours >= warning_threshold:
        sla_status = "AT_RISK"
        hours_remaining = max(0.0, breach_threshold - elapsed_hours)
    else:
        sla_status = "ON_TRACK"
        hours_remaining = max(0.0, breach_threshold - elapsed_hours)

    # Authority limit check
    uw_limit = settings.UNDERWRITER_DEFAULT_AUTHORITY_LIMIT
    if user and user.authority_limit:
        uw_limit = user.authority_limit

    requires_referral = submission.policy_limit > uw_limit

    return {
        "hours_in_queue": round(elapsed_hours, 1),
        "sla_status": sla_status,
        "sla_hours_remaining": round(hours_remaining, 1),
        "requires_manager_referral": requires_referral,
    }


def create_submission(
    db: Session,
    submission_in: SubmissionCreate,
    current_user: User,
) -> Submission:
    # Ensure ceding org exists
    org = (
        db.query(Organization)
        .filter(Organization.id == submission_in.ceding_org_id)
        .first()
    )
    if not org:
        # Create or fetch
        org = Organization(
            id=submission_in.ceding_org_id,
            name=f"Ceding Org {submission_in.ceding_org_id}",
            org_type="CEDING",
        )
        db.add(org)
        db.flush()

    sub_number = generate_submission_number(db)
    lob = normalize_lob(submission_in.line_of_business)

    submission = Submission(
        id=str(uuid.uuid4()),
        submission_number=sub_number,
        ceding_org_id=submission_in.ceding_org_id,
        created_by_user_id=current_user.id,
        insured_name=submission_in.insured_name,
        line_of_business=lob,
        policy_limit=submission_in.policy_limit,
        attachment_point=submission_in.attachment_point,
        retention=submission_in.retention,
        proposed_premium=submission_in.proposed_premium,
        effective_date=submission_in.effective_date,
        expiry_date=submission_in.expiry_date,
        industry=submission_in.industry,
        revenue_band=submission_in.revenue_band,
        jurisdiction=submission_in.jurisdiction,
        status="RECEIVED",
        completeness_status="INCOMPLETE",
        referral_status="NONE",
        additional_data=submission_in.additional_data,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(submission)
    db.flush()

    log_submission_action(
        db=db,
        submission_id=submission.id,
        action_type="CREATED",
        actor=current_user,
        new_state={
            "submission_number": sub_number,
            "status": "RECEIVED",
            "policy_limit": submission.policy_limit,
            "insured_name": submission.insured_name,
        },
        change_reason="Initial submission intake created",
    )

    db.commit()
    db.refresh(submission)
    return submission


def add_document_to_submission(
    db: Session,
    submission_id: str,
    doc_in: DocumentCreate,
    current_user: User,
) -> SubmissionDocument:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Check permission
    if (
        current_user.role == "CEDING_UNDERWRITER"
        and current_user.org_id
        and current_user.org_id != submission.ceding_org_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: cannot access another ceding company submission",
        )

    doc = SubmissionDocument(
        id=str(uuid.uuid4()),
        submission_id=submission_id,
        document_type=doc_in.document_type.upper(),
        file_name=doc_in.file_name,
        file_path=doc_in.file_path or f"/uploads/{submission_id}/{doc_in.file_name}",
        file_size_bytes=doc_in.file_size_bytes or 1024,
        content_type=doc_in.content_type or "application/pdf",
        is_mandatory=doc_in.is_mandatory or False,
        uploaded_by_user_id=current_user.id,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(doc)
    db.flush()

    # Recalculate completeness
    db.refresh(submission)
    completeness = evaluate_document_completeness(db, submission)
    prev_completeness = submission.completeness_status
    submission.completeness_status = completeness

    log_submission_action(
        db=db,
        submission_id=submission.id,
        action_type="DOCUMENT_UPLOADED",
        actor=current_user,
        previous_state={"completeness_status": prev_completeness},
        new_state={
            "document_type": doc.document_type,
            "file_name": doc.file_name,
            "completeness_status": completeness,
        },
        change_reason=f"Uploaded document {doc.file_name} ({doc.document_type})",
    )

    db.commit()
    db.refresh(doc)
    return doc


def get_submission_by_id(
    db: Session,
    submission_id: str,
    current_user: Optional[User] = None,
) -> SubmissionResponse:
    submission = (
        db.query(Submission)
        .options(
            joinedload(Submission.documents),
            joinedload(Submission.risk_scores),
            joinedload(Submission.quotes),
        )
        .filter(Submission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user and current_user.role == "CEDING_UNDERWRITER":
        if current_user.org_id and current_user.org_id != submission.ceding_org_id:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only view your own company's submissions",
            )

    sla_info = compute_sla_and_enrich(submission, current_user)

    docs_resp = [DocumentResponse.model_validate(d) for d in submission.documents]
    latest_score = submission.risk_scores[0] if submission.risk_scores else None
    latest_quote = submission.quotes[0] if submission.quotes else None

    resp = SubmissionResponse.model_validate(submission)
    resp.hours_in_queue = sla_info["hours_in_queue"]
    resp.sla_status = sla_info["sla_status"]
    resp.sla_hours_remaining = sla_info["sla_hours_remaining"]
    resp.requires_manager_referral = sla_info["requires_manager_referral"]
    resp.documents = docs_resp
    if latest_score:
        resp.latest_score = latest_score
    if latest_quote:
        resp.latest_quote = latest_quote

    return resp


def list_submissions(
    db: Session,
    current_user: Optional[User] = None,
    status_filter: Optional[str] = None,
    lob_filter: Optional[str] = None,
    ceding_org_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[SubmissionResponse], int]:
    query = db.query(Submission).options(
        joinedload(Submission.documents),
        joinedload(Submission.risk_scores),
        joinedload(Submission.quotes),
    )

    # RBAC filtering
    if current_user and current_user.role == "CEDING_UNDERWRITER":
        if current_user.org_id:
            query = query.filter(Submission.ceding_org_id == current_user.org_id)
        else:
            query = query.filter(Submission.created_by_user_id == current_user.id)
    elif ceding_org_id:
        query = query.filter(Submission.ceding_org_id == ceding_org_id)

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Submission.status == status_filter.upper())

    if lob_filter and lob_filter.upper() != "ALL":
        normalized = normalize_lob(lob_filter)
        query = query.filter(Submission.line_of_business == normalized)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Submission.insured_name.ilike(search_pattern),
                Submission.submission_number.ilike(search_pattern),
                Submission.industry.ilike(search_pattern),
            )
        )

    # Sorting
    sort_col = getattr(Submission, sort_by, Submission.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    total = query.count()
    submissions = query.offset(skip).limit(limit).all()

    enriched_items = []
    for sub in submissions:
        sla_info = compute_sla_and_enrich(sub, current_user)
        docs_resp = [DocumentResponse.model_validate(d) for d in sub.documents]
        latest_score = sub.risk_scores[0] if sub.risk_scores else None
        latest_quote = sub.quotes[0] if sub.quotes else None

        resp = SubmissionResponse.model_validate(sub)
        resp.hours_in_queue = sla_info["hours_in_queue"]
        resp.sla_status = sla_info["sla_status"]
        resp.sla_hours_remaining = sla_info["sla_hours_remaining"]
        resp.requires_manager_referral = sla_info["requires_manager_referral"]
        resp.documents = docs_resp
        if latest_score:
            resp.latest_score = latest_score
        if latest_quote:
            resp.latest_quote = latest_quote
        enriched_items.append(resp)

    return enriched_items, total

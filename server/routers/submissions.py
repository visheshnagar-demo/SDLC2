import uuid
from datetime import datetime, timezone, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from server.database import get_db
from server.models import (
    User,
    ReinsuranceSubmission,
    RiskProfile,
    SubmissionDocument,
    RiskScore,
    MissingInformationFlag,
    AuditLog,
)
from server.schemas import (
    ReinsuranceSubmissionCreate,
    ReinsuranceSubmissionDetailResponse,
    SubmissionListResponse,
    DeclineReason,
)
from server.routers.auth import get_current_user
from server.services.flagging_engine import evaluate_missing_information
from server.services.scoring_engine import calculate_risk_score

router = APIRouter(prefix="/api/v1/submissions", tags=["submissions"])

DECLINE_REASONS = [
    {
        "code": "HIGH_EXPOSURE_AGGREGATION",
        "label": "High Exposure Aggregation",
        "description": "Requested capacity or primary limit exceeds concentration thresholds or portfolio risk aggregation tolerance.",
    },
    {
        "code": "RISK_APPETITE_MISMATCH",
        "label": "Risk Appetite Mismatch",
        "description": "Insured industry sector, operational profile, or governance posture is outside facultative underwriting appetite.",
    },
    {
        "code": "HIGH_LOSS_RATIO",
        "label": "Adverse Loss History / High Loss Ratio",
        "description": "Historical 3-5 year claims frequency, severity, or loss ratio exceeds maximum allowable parameters.",
    },
    {
        "code": "INADEQUATE_SECURITY_CONTROLS",
        "label": "Inadequate Cybersecurity Posture",
        "description": "Absence of critical security controls such as MFA, immutable air-gapped backups, or EDR telemetry.",
    },
    {
        "code": "PENDING_REGULATORY_INQUIRY",
        "label": "Pending Regulatory Inquiries / Litigation",
        "description": "Material active inquiries, subpoenas, or shareholder class actions posing excessive executive liability.",
    },
    {
        "code": "FINANCIAL_INSTABILITY",
        "label": "Material Financial Restatement / Instability",
        "description": "Recent financial restatements, going concern qualifications, or weak balance sheet liquidity metrics.",
    },
    {
        "code": "INSUFFICIENT_RETENTION",
        "label": "Insufficient Primary Retention / Attachment Buffer",
        "description": "Primary policy retention or attachment point is insufficient given the underlying risk exposure profile.",
    },
]


@router.get("/decline-reasons", response_model=List[DeclineReason])
@router.get("/reasons", response_model=List[DeclineReason])
def get_submission_decline_reasons():
    return [DeclineReason(**r) for r in DECLINE_REASONS]


def generate_tracking_number(db: Session, risk_type: str) -> str:
    year = datetime.now(timezone.utc).year
    prefix_code = "CY" if "CYBER" in risk_type.upper() else "DO"
    count = db.query(ReinsuranceSubmission).count() + 1
    return f"FAC-{year}-{prefix_code}-{count:04d}"


@router.post(
    "",
    response_model=ReinsuranceSubmissionDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_submission(
    payload: ReinsuranceSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validation checks
    if payload.annual_revenue <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Annual revenue must be greater than zero.",
        )
    if payload.primary_policy_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Primary policy limit must be greater than zero.",
        )
    if payload.requested_reinsurance_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Requested reinsurance limit must be greater than zero.",
        )
    if payload.attachment_point < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Attachment point cannot be negative.",
        )

    tracking_num = generate_tracking_number(db, payload.risk_type)

    effective_dt = (
        payload.policy_effective_date or payload.effective_date or date.today()
    )
    if payload.policy_expiration_date or payload.expiration_date:
        expiration_dt = payload.policy_expiration_date or payload.expiration_date
    else:
        try:
            expiration_dt = date(
                effective_dt.year + 1, effective_dt.month, effective_dt.day
            )
        except ValueError:
            expiration_dt = date(effective_dt.year + 1, effective_dt.month, 28)

    submission = ReinsuranceSubmission(
        id=str(uuid.uuid4()),
        tracking_number=tracking_num,
        carrier_id=current_user.id if current_user else None,
        risk_type=payload.risk_type.upper(),
        insured_name=payload.insured_name,
        industry_sector=payload.industry_sector,
        annual_revenue=float(payload.annual_revenue),
        primary_policy_limit=float(payload.primary_policy_limit),
        requested_reinsurance_limit=float(payload.requested_reinsurance_limit),
        attachment_point=float(payload.attachment_point),
        policy_effective_date=effective_dt,
        policy_expiration_date=expiration_dt,
        status="SUBMITTED",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(submission)

    # Attach risk profile
    profile_model = None
    if payload.risk_profile:
        if isinstance(payload.risk_profile, dict):
            prof_data = payload.risk_profile.get("profile_data") or payload.risk_profile
            prior_losses = (
                payload.risk_profile.get("prior_losses_count")
                or payload.risk_profile.get("prior_cyber_incidents_3yr")
                or 0
            )
            total_loss = float(payload.risk_profile.get("total_loss_amount") or 0.0)
            sec_framework = payload.risk_profile.get("security_framework")
            mfa = (
                payload.risk_profile.get("mfa_enforced")
                if payload.risk_profile.get("mfa_enforced") is not None
                else payload.risk_profile.get("mfa_implemented")
            )
            backups = payload.risk_profile.get("has_offline_backups")
            pending_claims = (
                payload.risk_profile.get("has_pending_claims")
                if payload.risk_profile.get("has_pending_claims") is not None
                else payload.risk_profile.get("regulatory_investigation_pending")
            )
        else:
            prof_data = payload.risk_profile.profile_data or {}
            prior_losses = payload.risk_profile.prior_losses_count or 0
            total_loss = float(payload.risk_profile.total_loss_amount or 0.0)
            sec_framework = payload.risk_profile.security_framework
            mfa = payload.risk_profile.mfa_enforced
            backups = payload.risk_profile.has_offline_backups
            pending_claims = payload.risk_profile.has_pending_claims

        profile_model = RiskProfile(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            profile_data=prof_data,
            prior_losses_count=int(prior_losses),
            total_loss_amount=float(total_loss),
            security_framework=sec_framework,
            mfa_enforced=mfa,
            has_offline_backups=backups,
            has_pending_claims=pending_claims,
            created_at=datetime.now(timezone.utc),
        )
        db.add(profile_model)

    # Attach documents
    doc_models = []
    if payload.documents:
        for doc in payload.documents:
            d = SubmissionDocument(
                id=str(uuid.uuid4()),
                submission_id=submission.id,
                document_type=doc.document_type.upper(),
                file_name=doc.file_name,
                file_size_bytes=doc.file_size_bytes or 0,
                file_url=doc.file_url,
                is_verified=bool(
                    doc.is_verified or doc.uploaded or doc.status == "UPLOADED"
                ),
                uploaded_at=datetime.now(timezone.utc),
            )
            db.add(d)
            doc_models.append(d)

    # Run missing information evaluation
    flags_data = evaluate_missing_information(submission, profile_model, doc_models)
    flag_models = []
    for f in flags_data:
        flag = MissingInformationFlag(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            field_name=f["field_name"],
            flag_severity=f["flag_severity"],
            description=f["description"],
            is_resolved=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(flag)
        flag_models.append(flag)

    if any(f["flag_severity"] == "HIGH" for f in flags_data):
        submission.status = "FLAGGED"

    # Compute automated risk score
    score_data = calculate_risk_score(submission, profile_model, doc_models, flags_data)
    score_model = RiskScore(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        overall_score=score_data["overall_score"],
        completeness_score=score_data["completeness_score"],
        exposure_score=score_data["exposure_score"],
        loss_score=score_data["loss_score"],
        governance_score=score_data["governance_score"],
        risk_tier=score_data["risk_tier"],
        scoring_breakdown=score_data["scoring_breakdown"],
        scored_at=datetime.now(timezone.utc),
    )
    db.add(score_model)

    # Record initial audit log
    audit = AuditLog(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        actor_id=current_user.id if current_user else "SYSTEM",
        actor_role="CARRIER_REP",
        action="SUBMISSION_CREATED",
        state_before=None,
        state_after={
            "tracking_number": submission.tracking_number,
            "status": submission.status,
            "overall_score": score_model.overall_score,
            "risk_tier": score_model.risk_tier,
            "flags_count": len(flags_data),
        },
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)

    db.commit()
    db.refresh(submission)

    return submission


@router.get("", response_model=SubmissionListResponse)
def list_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    risk_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ReinsuranceSubmission)

    if risk_type:
        rt_norm = (
            risk_type.upper().replace("&", "_AND_").replace("-", "_").replace(" ", "_")
        )
        query = query.filter(
            ReinsuranceSubmission.risk_type.contains(
                "CYBER" if "CYBER" in rt_norm else "D_AND_O"
            )
        )
    if status:
        query = query.filter(ReinsuranceSubmission.status == status.upper())
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ReinsuranceSubmission.insured_name.ilike(search_filter))
            | (ReinsuranceSubmission.tracking_number.ilike(search_filter))
        )

    total = query.count()
    items = (
        query.order_by(desc(ReinsuranceSubmission.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return SubmissionListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{id}", response_model=ReinsuranceSubmissionDetailResponse)
def get_submission_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = (
        db.query(ReinsuranceSubmission).filter(ReinsuranceSubmission.id == id).first()
    )
    if not submission:
        # Check by tracking number as fallback
        submission = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.tracking_number == id)
            .first()
        )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{id}' not found.",
        )

    return submission

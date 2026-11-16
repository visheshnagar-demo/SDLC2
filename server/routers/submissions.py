import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server import models, schemas
from server.services.scoring_engine import RiskScoringEngine
from server.services.flagging_engine import MissingInformationFlaggingEngine

router = APIRouter(prefix="/api/v1", tags=["Submissions"])

DECLINE_REASONS_CATALOGUE = [
    schemas.DeclineReason(
        code="HIGH_EXPOSURE_AGGREGATION",
        description="Aggregate limit exposure exceeds reinsurance treaty portfolio risk tolerance.",
        category="EXPOSURE",
    ),
    schemas.DeclineReason(
        code="POOR_LOSS_HISTORY",
        description="Historical 3-year loss frequency and severity exceeds underwriting benchmark threshold.",
        category="LOSS_HISTORY",
    ),
    schemas.DeclineReason(
        code="UNSATISFACTORY_CYBER_HYGIENE",
        description="Critical cybersecurity risk controls (MFA, immutable backups, compliance certification) unverified.",
        category="RISK_CONTROLS",
    ),
    schemas.DeclineReason(
        code="EXCESSIVE_POLICY_LIMIT",
        description="Requested facultative limit is disproportionate to primary carrier attachment point.",
        category="LIMITS",
    ),
    schemas.DeclineReason(
        code="HIGH_RISK_INDUSTRY",
        description="Insured operates in an excluded or restricted high-hazard industry sector.",
        category="INDUSTRY",
    ),
    schemas.DeclineReason(
        code="MISSING_MANDATORY_EVIDENCE",
        description="Carrier failed to provide required underwriting evidence and financial disclosures.",
        category="DOCUMENTATION",
    ),
]


def generate_tracking_number(risk_type: str, db: Session) -> str:
    prefix = "CY" if "CYBER" in risk_type.upper() else "DO"
    rand_num = random.randint(1000, 9999)
    tracking = f"FAC-2026-{prefix}-{rand_num}"
    return tracking


@router.get("/submissions/decline-reasons", response_model=List[schemas.DeclineReason])
@router.get("/decline-reasons", response_model=List[schemas.DeclineReason])
def get_decline_reasons():
    return DECLINE_REASONS_CATALOGUE


@router.post(
    "/submissions",
    response_model=schemas.ReinsuranceSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_submission(
    payload: schemas.ReinsuranceSubmissionCreate,
    db: Session = Depends(get_db),
):
    tracking_number = generate_tracking_number(payload.risk_type, db)

    submission = models.ReinsuranceSubmission(
        tracking_number=tracking_number,
        risk_type=payload.risk_type,
        insured_name=payload.insured_name,
        industry_sector=payload.industry_sector,
        annual_revenue=payload.annual_revenue,
        primary_policy_limit=payload.primary_policy_limit,
        requested_reinsurance_limit=payload.requested_reinsurance_limit,
        attachment_point=payload.attachment_point,
        policy_effective_date=payload.policy_effective_date,
        policy_expiration_date=payload.policy_expiration_date,
        status="SUBMITTED",
    )
    db.add(submission)
    db.flush()

    # Risk Profile
    risk_profile = None
    if payload.risk_profile:
        risk_profile = models.RiskProfile(
            submission_id=submission.id,
            claims_count_3yr=payload.risk_profile.claims_count_3yr or 0,
            total_losses_3yr=payload.risk_profile.total_losses_3yr or 0.0,
            security_framework=payload.risk_profile.security_framework,
            mfa_enforced=payload.risk_profile.mfa_enforced or False,
            backup_immutable=payload.risk_profile.backup_immutable or False,
            board_governance_score=payload.risk_profile.board_governance_score or 0.0,
            regulatory_enforcement_action=payload.risk_profile.regulatory_enforcement_action
            or False,
            esg_risk_rating=payload.risk_profile.esg_risk_rating,
            details=payload.risk_profile.details,
        )
        db.add(risk_profile)
        db.flush()

    # Documents
    doc_objs = []
    if payload.documents:
        for doc in payload.documents:
            d = models.SubmissionDocument(
                submission_id=submission.id,
                document_type=doc.document_type,
                file_name=doc.file_name,
                file_size=doc.file_size or 0,
                file_url=doc.file_url,
                status=doc.status or "VERIFIED",
            )
            db.add(d)
            doc_objs.append(d)
        db.flush()

    # Evaluate Flags
    flags = MissingInformationFlaggingEngine.evaluate_flags(
        submission=submission,
        profile=risk_profile,
        documents=doc_objs,
    )
    flag_count = len(flags)
    submission.missing_flags_count = flag_count

    for f in flags:
        flag_obj = models.MissingInformationFlag(
            submission_id=submission.id,
            field_or_document_name=f["field_or_document_name"],
            description=f["description"],
            severity=f.get("severity", "MEDIUM"),
            is_resolved=False,
        )
        db.add(flag_obj)

    # Calculate Risk Score
    score_data = RiskScoringEngine.calculate_score(
        submission=submission,
        profile=risk_profile,
        documents=doc_objs,
    )
    submission.overall_risk_score = score_data["composite_score"]
    submission.risk_tier = score_data["risk_tier"]
    if flag_count > 0:
        submission.status = "FLAGGED"

    risk_score_obj = models.RiskScore(
        submission_id=submission.id,
        composite_score=score_data["composite_score"],
        completeness_score=score_data["completeness_score"],
        exposure_score=score_data["exposure_score"],
        loss_history_score=score_data["loss_history_score"],
        governance_score=score_data["governance_score"],
        risk_tier=score_data["risk_tier"],
        benchmark_delta=score_data["benchmark_delta"],
        notes=score_data["notes"],
    )
    db.add(risk_score_obj)

    # Audit Log
    audit = models.AuditLog(
        submission_id=submission.id,
        actor_id="carrier_representative",
        actor_role="Carrier_Representative",
        action="SUBMISSION_CREATED",
        state_before=None,
        state_after=submission.status,
        details=f"Facultative request submitted for {submission.insured_name} ({submission.risk_type})",
    )
    db.add(audit)

    db.commit()
    db.refresh(submission)
    return submission


@router.get(
    "/submissions",
    response_model=List[schemas.ReinsuranceSubmissionResponse],
)
def list_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    risk_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.ReinsuranceSubmission)
    if status:
        query = query.filter(models.ReinsuranceSubmission.status == status.upper())
    if risk_type:
        rt = risk_type.upper().replace("&", "_AND_")
        query = query.filter(models.ReinsuranceSubmission.risk_type.like(f"%{rt}%"))
    if search:
        query = query.filter(
            models.ReinsuranceSubmission.insured_name.ilike(f"%{search}%")
            | models.ReinsuranceSubmission.tracking_number.ilike(f"%{search}%")
        )
    return (
        query.order_by(models.ReinsuranceSubmission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/submissions/{submission_id}",
    response_model=schemas.ReinsuranceSubmissionResponse,
)
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db),
):
    sub = (
        db.query(models.ReinsuranceSubmission)
        .filter(
            (models.ReinsuranceSubmission.id == submission_id)
            | (models.ReinsuranceSubmission.tracking_number == submission_id)
        )
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission {submission_id} not found",
        )
    return sub

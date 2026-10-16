from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import ReinsuranceSubmission, CarrierProfile, SubmissionDocument
from server.schemas import (
    SubmissionCreateRequest,
    SubmissionResponse,
    AttachmentCreateRequest,
    DocumentResponse,
    CarrierProfileCreate,
    CarrierProfileResponse,
)
from server.services.scoring_engine import calculate_risk_score
from server.services.checklist_service import evaluate_checklist

router = APIRouter(prefix="/api/v1", tags=["Submissions & Carriers"])


# ==========================================
# Carrier Profiles Endpoints
# ==========================================
@router.post(
    "/carriers",
    response_model=CarrierProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_carrier_profile(
    carrier_in: CarrierProfileCreate, db: Session = Depends(get_db)
):
    existing = (
        db.query(CarrierProfile).filter_by(carrier_name=carrier_in.carrier_name).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Carrier with name '{carrier_in.carrier_name}' already exists.",
        )
    carrier = CarrierProfile(
        carrier_name=carrier_in.carrier_name,
        am_best_rating=carrier_in.am_best_rating,
        contact_email=carrier_in.contact_email,
        contact_phone=carrier_in.contact_phone,
    )
    db.add(carrier)
    db.commit()
    db.refresh(carrier)
    return carrier


@router.get("/carriers", response_model=List[CarrierProfileResponse])
def list_carrier_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return db.query(CarrierProfile).offset(skip).limit(limit).all()


@router.get("/carriers/{carrier_id}", response_model=CarrierProfileResponse)
def get_carrier_profile(carrier_id: str, db: Session = Depends(get_db)):
    carrier = db.query(CarrierProfile).filter_by(id=carrier_id).first()
    if not carrier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Carrier profile not found."
        )
    return carrier


# ==========================================
# Submissions Endpoints
# ==========================================
@router.post(
    "/submissions",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_submission(payload: SubmissionCreateRequest, db: Session = Depends(get_db)):
    # Validate carrier exists
    carrier = db.query(CarrierProfile).filter_by(id=payload.carrier_id).first()
    if not carrier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Carrier profile with ID '{payload.carrier_id}' not found.",
        )

    risk_type = payload.risk_type.upper()
    if risk_type not in ["CYBER", "D_AND_O", "D&O"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Risk type must be either 'CYBER' or 'D_AND_O'.",
        )

    if payload.limit_requested <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Limit requested must be positive.",
        )

    if payload.retention <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Retention must be positive.",
        )

    submission = ReinsuranceSubmission(
        carrier_id=payload.carrier_id,
        risk_type=risk_type,
        insured_name=payload.insured_name.strip(),
        industry_sector=payload.industry_sector,
        annual_revenue=payload.annual_revenue or 0.0,
        employee_count=payload.employee_count or 0,
        limit_requested=payload.limit_requested,
        attachment_point=payload.attachment_point,
        retention=payload.retention,
        effective_date=payload.effective_date,
        expiry_date=payload.expiry_date,
        prior_loss_count=payload.prior_loss_count or 0,
        prior_loss_total=payload.prior_loss_total or 0.0,
        risk_attributes=payload.risk_attributes or {},
        notes=payload.notes,
        status="SUBMITTED",
    )

    # Calculate initial automated risk score & tier
    score, tier = calculate_risk_score(submission)
    submission.risk_score = score
    submission.risk_tier = tier

    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Automatically evaluate underwriting completeness checklist and missing info flags
    evaluate_checklist(db, submission.id)
    db.refresh(submission)

    return submission


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission_details(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )
    return submission


@router.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    risk_type: Optional[str] = None,
    carrier_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(ReinsuranceSubmission)
    if status_filter:
        query = query.filter(ReinsuranceSubmission.status == status_filter.upper())
    if risk_type:
        query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
    if carrier_id:
        query = query.filter(ReinsuranceSubmission.carrier_id == carrier_id)
    return (
        query.order_by(ReinsuranceSubmission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ==========================================
# Attachments Endpoints
# ==========================================
@router.post(
    "/submissions/{submission_id}/attachments",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_attachment(
    submission_id: str, payload: AttachmentCreateRequest, db: Session = Depends(get_db)
):
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )

    doc_type = payload.document_type.upper()
    file_path = (
        payload.file_path
        or f"gs://reinsurance-documents/{submission_id}/{payload.file_name}"
    )

    document = SubmissionDocument(
        submission_id=submission_id,
        document_type=doc_type,
        file_name=payload.file_name,
        file_path=file_path,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Re-evaluate checklist now that a document has been added
    evaluate_checklist(db, submission_id)

    return document


@router.get(
    "/submissions/{submission_id}/attachments", response_model=List[DocumentResponse]
)
def list_attachments(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )
    return db.query(SubmissionDocument).filter_by(submission_id=submission_id).all()

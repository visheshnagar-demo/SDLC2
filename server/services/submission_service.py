import random
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from server.models import (
    ReinsuranceSubmission,
    SubmissionDocument,
    SubmissionMissingFlag,
)
from server.schemas import (
    ReinsuranceSubmissionCreate,
)
from server.services.scoring_service import RiskScoringService
from server.services.validation_engine import MissingInfoValidationEngine


class SubmissionService:
    @staticmethod
    def generate_reference(risk_category: str) -> str:
        cat_code = "CYB" if risk_category.upper() == "CYBER" else "DO"
        seq = random.randint(10000, 99999)
        year = datetime.now(timezone.utc).year
        return f"FAC-{year}-{cat_code}-{seq}"

    @classmethod
    def create_submission(
        cls, db: Session, payload: ReinsuranceSubmissionCreate
    ) -> ReinsuranceSubmission:
        # 1. Calculate risk score
        score_res = RiskScoringService.calculate_risk_score(
            risk_category=payload.risk_category,
            policy_limit_usd=payload.policy_limit_usd,
            attachment_point_usd=payload.attachment_point_usd,
            carrier_rating=payload.carrier_rating,
            industry_sector=payload.industry_sector,
            prior_loss_amount_usd=payload.prior_loss_amount_usd,
        )

        # 2. Evaluate missing information flags
        missing_flags_data = MissingInfoValidationEngine.evaluate_missing_information(
            risk_category=payload.risk_category,
            attached_documents=payload.attached_documents or [],
        )

        has_missing_info = len(missing_flags_data) > 0
        submission_id = str(uuid.uuid4())
        ref = cls.generate_reference(payload.risk_category.value)

        submission = ReinsuranceSubmission(
            id=submission_id,
            submission_reference=ref,
            carrier_name=payload.carrier_name,
            carrier_rating=payload.carrier_rating,
            risk_category=payload.risk_category.value,
            insured_entity_name=payload.insured_entity_name,
            industry_sector=payload.industry_sector,
            policy_limit_usd=payload.policy_limit_usd,
            attachment_point_usd=payload.attachment_point_usd,
            effective_date=payload.effective_date,
            expiration_date=payload.expiration_date,
            primary_policy_number=payload.primary_policy_number,
            prior_loss_amount_usd=payload.prior_loss_amount_usd,
            risk_score=score_res.risk_score,
            priority=score_res.priority,
            status="SUBMITTED",
            has_missing_info=has_missing_info,
        )

        db.add(submission)

        # Add documents
        if payload.attached_documents:
            for doc in payload.attached_documents:
                doc_entity = SubmissionDocument(
                    id=str(uuid.uuid4()),
                    submission_id=submission_id,
                    document_type=doc.document_type,
                    file_name=doc.file_name,
                    file_size_bytes=doc.file_size_bytes,
                    storage_uri=doc.storage_uri,
                )
                db.add(doc_entity)

        # Add missing flags
        for flag_info in missing_flags_data:
            flag_entity = SubmissionMissingFlag(
                id=str(uuid.uuid4()),
                submission_id=submission_id,
                field_name=flag_info["field_name"],
                flag_message=flag_info["flag_message"],
                is_blocking=flag_info["is_blocking"],
                is_resolved=False,
            )
            db.add(flag_entity)

        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def get_submission_by_id(db: Session, submission_id: str) -> ReinsuranceSubmission:
        sub = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.id == submission_id)
            .first()
        )
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reinsurance submission with id '{submission_id}' not found.",
            )
        return sub

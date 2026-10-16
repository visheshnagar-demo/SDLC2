import uuid
import random
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from server.models.user import User
from server.models.submission import ReinsuranceSubmission
from server.models.attachment import SubmissionAttachment
from server.models.missing_flag import MissingInformationFlag
from server.models.risk_score import RiskScoreBreakdown
from server.schemas.submission import SubmissionCreate, SubmissionUpdate
from server.services.scoring_engine import ScoringEngine
from server.services.missing_detector import MissingInformationDetector
from server.services.audit_service import AuditService


class SubmissionService:
    @staticmethod
    def generate_reference(risk_type: str) -> str:
        prefix = "CYB" if (risk_type or "").upper() == "CYBER" else "DNO"
        year = datetime.now(timezone.utc).year
        seq = random.randint(1000, 9999)
        return f"FAC-{year}-{prefix}-{seq}"

    @classmethod
    def create_submission(
        cls,
        db: Session,
        carrier: User,
        data: SubmissionCreate,
    ) -> ReinsuranceSubmission:
        sub_id = str(uuid.uuid4())
        ref = cls.generate_reference(data.risk_type)
        status = "SUBMITTED" if data.is_final_submission else "DRAFT"

        submission = ReinsuranceSubmission(
            id=sub_id,
            submission_reference=ref,
            carrier_id=carrier.id,
            risk_type=data.risk_type.upper(),
            insured_name=data.insured_name,
            industry_segment=data.industry_segment,
            annual_revenue=data.annual_revenue,
            sum_insured=data.sum_insured,
            attachment_point=data.attachment_point,
            policy_start_date=data.policy_start_date,
            policy_end_date=data.policy_end_date,
            prior_claims_count=data.prior_claims_count,
            prior_claims_total=data.prior_claims_total,
            security_governance_score=data.security_governance_score,
            status=status,
        )

        db.add(submission)
        db.flush()

        # Score risk
        score, tier, rules = ScoringEngine.evaluate_risk(
            risk_type=data.risk_type,
            annual_revenue=data.annual_revenue,
            sum_insured=data.sum_insured,
            attachment_point=data.attachment_point,
            prior_claims_count=data.prior_claims_count,
            prior_claims_total=data.prior_claims_total,
            security_governance_score=data.security_governance_score,
            industry_segment=data.industry_segment,
        )

        submission.risk_score = score
        submission.risk_tier = tier

        for rule in rules:
            breakdown = RiskScoreBreakdown(
                id=str(uuid.uuid4()),
                submission_id=sub_id,
                rule_key=rule["rule_key"],
                rule_name=rule["rule_name"],
                score_delta=rule["score_delta"],
                rationale=rule["rationale"],
            )
            db.add(breakdown)

        # Audit missing info
        flags = MissingInformationDetector.audit_submission(
            risk_type=data.risk_type,
            annual_revenue=data.annual_revenue,
            sum_insured=data.sum_insured,
            attachment_point=data.attachment_point,
            policy_start_date=data.policy_start_date,
            policy_end_date=data.policy_end_date,
            prior_claims_count=data.prior_claims_count,
            security_governance_score=data.security_governance_score,
            attachments=[],
        )

        for flag in flags:
            db_flag = MissingInformationFlag(
                id=str(uuid.uuid4()),
                submission_id=sub_id,
                flag_code=flag["flag_code"],
                field_name=flag["field_name"],
                severity=flag["severity"],
                message=flag["message"],
                is_resolved=False,
            )
            db.add(db_flag)

        db.commit()
        db.refresh(submission)

        # Log audit
        AuditService.log_event(
            db=db,
            entity_type="submission",
            entity_id=sub_id,
            action="CREATE" if status == "DRAFT" else "SUBMIT",
            actor_user_id=carrier.id,
            actor_role=carrier.role,
            state_diff={"status": status, "risk_score": score, "risk_tier": tier},
        )

        return submission

    @classmethod
    def update_submission(
        cls,
        db: Session,
        submission: ReinsuranceSubmission,
        data: SubmissionUpdate,
        user: User,
    ) -> ReinsuranceSubmission:
        if data.risk_type is not None:
            submission.risk_type = data.risk_type.upper()
        if data.insured_name is not None:
            submission.insured_name = data.insured_name
        if data.industry_segment is not None:
            submission.industry_segment = data.industry_segment
        if data.annual_revenue is not None:
            submission.annual_revenue = data.annual_revenue
        if data.sum_insured is not None:
            submission.sum_insured = data.sum_insured
        if data.attachment_point is not None:
            submission.attachment_point = data.attachment_point
        if data.policy_start_date is not None:
            submission.policy_start_date = data.policy_start_date
        if data.policy_end_date is not None:
            submission.policy_end_date = data.policy_end_date
        if data.prior_claims_count is not None:
            submission.prior_claims_count = data.prior_claims_count
        if data.prior_claims_total is not None:
            submission.prior_claims_total = data.prior_claims_total
        if data.security_governance_score is not None:
            submission.security_governance_score = data.security_governance_score
        if data.is_final_submission:
            submission.status = "SUBMITTED"

        # Re-score
        score, tier, rules = ScoringEngine.evaluate_risk(
            risk_type=submission.risk_type,
            annual_revenue=submission.annual_revenue,
            sum_insured=submission.sum_insured,
            attachment_point=submission.attachment_point,
            prior_claims_count=submission.prior_claims_count,
            prior_claims_total=submission.prior_claims_total,
            security_governance_score=submission.security_governance_score,
            industry_segment=submission.industry_segment,
        )
        submission.risk_score = score
        submission.risk_tier = tier

        # Refresh rules
        db.query(RiskScoreBreakdown).filter(
            RiskScoreBreakdown.submission_id == submission.id
        ).delete()
        for rule in rules:
            breakdown = RiskScoreBreakdown(
                id=str(uuid.uuid4()),
                submission_id=submission.id,
                rule_key=rule["rule_key"],
                rule_name=rule["rule_name"],
                score_delta=rule["score_delta"],
                rationale=rule["rationale"],
            )
            db.add(breakdown)

        # Re-evaluate missing flags
        attachments = (
            db.query(SubmissionAttachment)
            .filter(SubmissionAttachment.submission_id == submission.id)
            .all()
        )
        flags = MissingInformationDetector.audit_submission(
            risk_type=submission.risk_type,
            annual_revenue=submission.annual_revenue,
            sum_insured=submission.sum_insured,
            attachment_point=submission.attachment_point,
            policy_start_date=submission.policy_start_date,
            policy_end_date=submission.policy_end_date,
            prior_claims_count=submission.prior_claims_count,
            security_governance_score=submission.security_governance_score,
            attachments=attachments,
        )
        db.query(MissingInformationFlag).filter(
            MissingInformationFlag.submission_id == submission.id
        ).delete()
        for flag in flags:
            db_flag = MissingInformationFlag(
                id=str(uuid.uuid4()),
                submission_id=submission.id,
                flag_code=flag["flag_code"],
                field_name=flag["field_name"],
                severity=flag["severity"],
                message=flag["message"],
                is_resolved=False,
            )
            db.add(db_flag)

        db.commit()
        db.refresh(submission)

        AuditService.log_event(
            db=db,
            entity_type="submission",
            entity_id=submission.id,
            action="UPDATE" if submission.status == "DRAFT" else "SUBMIT",
            actor_user_id=user.id,
            actor_role=user.role,
            state_diff={
                "status": submission.status,
                "risk_score": score,
                "risk_tier": tier,
            },
        )

        return submission

    @staticmethod
    def get_submissions_for_carrier(
        db: Session,
        carrier_id: str,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[ReinsuranceSubmission]]:
        query = db.query(ReinsuranceSubmission).filter(
            ReinsuranceSubmission.carrier_id == carrier_id
        )
        if status:
            query = query.filter(ReinsuranceSubmission.status == status.upper())
        total = query.count()
        items = (
            query.order_by(desc(ReinsuranceSubmission.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
        return total, items

    @staticmethod
    def add_attachment(
        db: Session,
        submission: ReinsuranceSubmission,
        user: User,
        document_category: str,
        file_name: str,
        file_size_bytes: int,
        mime_type: str,
        storage_path: str,
    ) -> SubmissionAttachment:
        att = SubmissionAttachment(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            document_category=document_category.upper(),
            file_name=file_name,
            file_size_bytes=file_size_bytes,
            mime_type=mime_type,
            storage_path=storage_path,
        )
        db.add(att)
        db.flush()

        # Re-evaluate missing info flags with the new attachment
        all_attachments = (
            db.query(SubmissionAttachment)
            .filter(SubmissionAttachment.submission_id == submission.id)
            .all()
        )
        flags = MissingInformationDetector.audit_submission(
            risk_type=submission.risk_type,
            annual_revenue=submission.annual_revenue,
            sum_insured=submission.sum_insured,
            attachment_point=submission.attachment_point,
            policy_start_date=submission.policy_start_date,
            policy_end_date=submission.policy_end_date,
            prior_claims_count=submission.prior_claims_count,
            security_governance_score=submission.security_governance_score,
            attachments=all_attachments,
        )

        db.query(MissingInformationFlag).filter(
            MissingInformationFlag.submission_id == submission.id
        ).delete()
        for flag in flags:
            db_flag = MissingInformationFlag(
                id=str(uuid.uuid4()),
                submission_id=submission.id,
                flag_code=flag["flag_code"],
                field_name=flag["field_name"],
                severity=flag["severity"],
                message=flag["message"],
                is_resolved=False,
            )
            db.add(db_flag)

        db.commit()
        db.refresh(att)

        AuditService.log_event(
            db=db,
            entity_type="attachment",
            entity_id=att.id,
            action="UPLOAD",
            actor_user_id=user.id,
            actor_role=user.role,
            state_diff={"category": document_category, "file_name": file_name},
        )

        return att

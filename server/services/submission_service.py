import uuid
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from server.models.submission import Submission
from server.models.risk_profile import CyberRiskProfile, DoRiskProfile
from server.models.evaluation import RiskScore, MissingInfoFlag
from server.schemas.submission import SubmissionCreate
from server.services.scoring_engine import RiskScoringEngine
from server.services.flagging_engine import FlaggingEngine
from server.services.audit_service import AuditService


class SubmissionService:
    @staticmethod
    def create_submission(db: Session, data: SubmissionCreate) -> Submission:
        # Validate date consistency
        try:
            start_dt = datetime.strptime(data.policy_start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(data.policy_end_date, "%Y-%m-%d")
            if end_dt <= start_dt:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="policy_end_date must be strictly after policy_start_date",
                )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid date format: {str(e)}",
            )

        # Additional financial validation
        if data.primary_limit <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="primary_limit must be greater than zero",
            )
        if data.ceded_limit <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="ceded_limit must be greater than zero",
            )
        if data.carrier_premium <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="carrier_premium must be greater than zero",
            )

        submission_id = str(uuid.uuid4())
        submission = Submission(
            id=submission_id,
            carrier_name=data.carrier_name,
            insured_name=data.insured_name,
            risk_type=data.risk_type.upper(),
            primary_limit=data.primary_limit,
            attachment_point=data.attachment_point,
            ceded_limit=data.ceded_limit,
            carrier_premium=data.carrier_premium,
            policy_start_date=data.policy_start_date,
            policy_end_date=data.policy_end_date,
            status="PENDING",
            risk_score=0.0,
            risk_tier="MEDIUM",
        )
        db.add(submission)
        db.flush()

        cyber_prof: Optional[CyberRiskProfile] = None
        do_prof: Optional[DoRiskProfile] = None

        if submission.risk_type == "CYBER" and data.cyber_profile:
            cyber_prof = CyberRiskProfile(
                id=str(uuid.uuid4()),
                submission_id=submission_id,
                mfa_enabled=data.cyber_profile.mfa_enabled,
                edr_implemented=data.cyber_profile.edr_implemented,
                offline_backups=data.cyber_profile.offline_backups,
                encryption_at_rest=data.cyber_profile.encryption_at_rest,
                record_count=data.cyber_profile.record_count,
                prior_ransomware_claims=data.cyber_profile.prior_ransomware_claims,
                prior_claims_amount=data.cyber_profile.prior_claims_amount or 0.0,
                security_training=data.cyber_profile.security_training,
            )
            db.add(cyber_prof)
            db.flush()

        elif submission.risk_type == "DO" and data.do_profile:
            do_prof = DoRiskProfile(
                id=str(uuid.uuid4()),
                submission_id=submission_id,
                leverage_ratio=data.do_profile.leverage_ratio,
                executive_turnover_rate=data.do_profile.executive_turnover_rate,
                active_litigation=data.do_profile.active_litigation,
                litigation_details=data.do_profile.litigation_details,
                independent_board_charter=data.do_profile.independent_board_charter,
                regulatory_investigations=data.do_profile.regulatory_investigations,
                annual_revenue=data.do_profile.annual_revenue,
            )
            db.add(do_prof)
            db.flush()

        # Score the risk
        score_val, risk_tier, breakdown_json = RiskScoringEngine.calculate_score(
            submission=submission, cyber_profile=cyber_prof, do_profile=do_prof
        )
        submission.risk_score = score_val
        submission.risk_tier = risk_tier

        risk_score_rec = RiskScore(
            id=str(uuid.uuid4()),
            submission_id=submission_id,
            overall_score=score_val,
            risk_tier=risk_tier,
            breakdown_json=breakdown_json,
        )
        db.add(risk_score_rec)

        # Flag missing info
        flags = FlaggingEngine.evaluate_flags(
            submission=submission, cyber_profile=cyber_prof, do_profile=do_prof
        )
        for flag in flags:
            db.add(flag)

        # Audit log
        AuditService.log_action(
            db=db,
            submission_id=submission_id,
            action="SUBMISSION_CREATED",
            details=f"Created facultative placement {submission_id} for {submission.insured_name} (Score: {score_val}, Flags: {len(flags)})",
        )

        db.commit()
        db.refresh(submission)
        return submission

    @staticmethod
    def get_submission(db: Session, submission_id: str) -> Optional[Submission]:
        return db.query(Submission).filter(Submission.id == submission_id).first()

    @staticmethod
    def list_submissions(
        db: Session,
        risk_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        min_score: Optional[float] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Submission], int]:
        query = db.query(Submission)

        if risk_type:
            query = query.filter(Submission.risk_type == risk_type.upper().strip())
        if status_filter:
            query = query.filter(Submission.status == status_filter.upper().strip())
        if min_score is not None:
            query = query.filter(Submission.risk_score >= min_score)

        total = query.count()
        # Sort by high risk scores / newest first
        items = (
            query.order_by(Submission.created_at.desc()).offset(skip).limit(limit).all()
        )
        return items, total

    @staticmethod
    def get_flags(db: Session, submission_id: str) -> List[MissingInfoFlag]:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with id {submission_id} not found",
            )
        return (
            db.query(MissingInfoFlag)
            .filter(MissingInfoFlag.submission_id == submission_id)
            .all()
        )

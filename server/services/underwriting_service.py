import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from fastapi import HTTPException
from server.models.user import User
from server.models.submission import ReinsuranceSubmission
from server.models.missing_flag import MissingInformationFlag
from server.models.decision import UnderwritingDecision
from server.models.audit_log import AuditLog
from server.schemas.decision import DecisionCreate
from server.services.audit_service import AuditService

VALID_DECLINE_REASONS = {
    "RISK_APPETITE_EXCEEDED",
    "INADEQUATE_ATTACHMENT",
    "UNFAVORABLE_LOSS_HISTORY",
    "INCOMPLETE_DATA",
    "CAPACITY_UNAVAILABLE",
    "OTHER",
}


class UnderwritingService:
    @staticmethod
    def get_queue(
        db: Session,
        risk_type: Optional[str] = None,
        risk_tier: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[Dict[str, Any]]]:
        query = db.query(ReinsuranceSubmission).join(
            User, ReinsuranceSubmission.carrier_id == User.id
        )

        # Filters
        if risk_type:
            query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
        if risk_tier:
            query = query.filter(ReinsuranceSubmission.risk_tier == risk_tier.upper())
        if status:
            query = query.filter(ReinsuranceSubmission.status == status.upper())
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    ReinsuranceSubmission.insured_name.ilike(search_pattern),
                    ReinsuranceSubmission.submission_reference.ilike(search_pattern),
                    User.company_name.ilike(search_pattern),
                    User.full_name.ilike(search_pattern),
                )
            )

        total = query.count()

        # Sorting
        order_col = ReinsuranceSubmission.created_at
        if sort_by == "risk_score":
            order_col = ReinsuranceSubmission.risk_score
        elif sort_by == "sum_insured":
            order_col = ReinsuranceSubmission.sum_insured
        elif sort_by == "insured_name":
            order_col = ReinsuranceSubmission.insured_name
        elif sort_by == "submission_reference":
            order_col = ReinsuranceSubmission.submission_reference

        if sort_order.lower() == "asc":
            query = query.order_by(asc(order_col))
        else:
            query = query.order_by(desc(order_col))

        submissions = query.offset(skip).limit(limit).all()

        items = []
        for sub in submissions:
            carrier = sub.carrier
            missing_flags = [
                {
                    "id": f.id,
                    "submission_id": f.submission_id,
                    "flag_code": f.flag_code,
                    "field_name": f.field_name,
                    "severity": f.severity,
                    "message": f.message,
                    "is_resolved": f.is_resolved,
                    "created_at": f.created_at,
                }
                for f in sub.missing_flags
            ]
            items.append(
                {
                    "id": sub.id,
                    "submission_reference": sub.submission_reference,
                    "carrier_name": carrier.full_name if carrier else "Unknown",
                    "carrier_company": carrier.company_name if carrier else "Unknown",
                    "insured_name": sub.insured_name,
                    "industry_segment": sub.industry_segment,
                    "risk_type": sub.risk_type,
                    "annual_revenue": sub.annual_revenue,
                    "sum_insured": sub.sum_insured,
                    "attachment_point": sub.attachment_point,
                    "risk_score": sub.risk_score,
                    "risk_tier": sub.risk_tier,
                    "status": sub.status,
                    "missing_flags": missing_flags,
                    "active_lock_user_id": sub.active_lock_user_id,
                    "locked_at": sub.locked_at,
                    "created_at": sub.created_at,
                }
            )

        return total, items

    @staticmethod
    def get_submission_detail(
        db: Session, submission_id: str
    ) -> Optional[Dict[str, Any]]:
        sub = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.id == submission_id)
            .first()
        )
        if not sub:
            return None

        carrier = sub.carrier
        attachments = [
            {
                "id": a.id,
                "attachment_id": a.id,
                "submission_id": a.submission_id,
                "document_category": a.document_category,
                "file_name": a.file_name,
                "file_size_bytes": a.file_size_bytes,
                "mime_type": a.mime_type,
                "uploaded_at": a.uploaded_at,
            }
            for a in sub.attachments
        ]
        missing_flags = [
            {
                "id": f.id,
                "submission_id": f.submission_id,
                "flag_code": f.flag_code,
                "field_name": f.field_name,
                "severity": f.severity,
                "message": f.message,
                "is_resolved": f.is_resolved,
                "created_at": f.created_at,
            }
            for f in sub.missing_flags
        ]
        risk_score_breakdowns = [
            {
                "id": r.id,
                "rule_key": r.rule_key,
                "rule_name": r.rule_name,
                "score_delta": r.score_delta,
                "rationale": r.rationale,
                "evaluated_at": r.evaluated_at,
            }
            for r in sub.risk_score_breakdowns
        ]

        decision_data = None
        if sub.decision:
            d = sub.decision
            decision_data = {
                "id": d.id,
                "decision_id": d.id,
                "submission_id": d.submission_id,
                "underwriter_id": d.underwriter_id,
                "decision": d.decision,
                "status": sub.status,
                "capacity_offered": d.capacity_offered,
                "rate_on_line_pct": d.rate_on_line_pct,
                "premium_amount": d.premium_amount,
                "binding_deadline": d.binding_deadline,
                "subjectivities": d.subjectivities,
                "decline_reason_code": d.decline_reason_code,
                "decline_notes": d.decline_notes,
                "decided_at": d.decided_at,
            }

        audit_logs = [
            {
                "id": al.id,
                "entity_type": al.entity_type,
                "entity_id": al.entity_id,
                "action": al.action,
                "actor_user_id": al.actor_user_id,
                "actor_role": al.actor_role,
                "state_diff_json": al.state_diff_json,
                "timestamp": al.timestamp,
            }
            for al in db.query(AuditLog)
            .filter(AuditLog.entity_id == submission_id)
            .order_by(desc(AuditLog.timestamp))
            .all()
        ]

        return {
            "id": sub.id,
            "submission_reference": sub.submission_reference,
            "carrier_id": sub.carrier_id,
            "carrier_name": carrier.full_name if carrier else "Unknown",
            "carrier_company": carrier.company_name if carrier else "Unknown",
            "risk_type": sub.risk_type,
            "insured_name": sub.insured_name,
            "industry_segment": sub.industry_segment,
            "annual_revenue": sub.annual_revenue,
            "sum_insured": sub.sum_insured,
            "attachment_point": sub.attachment_point,
            "policy_start_date": sub.policy_start_date,
            "policy_end_date": sub.policy_end_date,
            "prior_claims_count": sub.prior_claims_count,
            "prior_claims_total": sub.prior_claims_total,
            "security_governance_score": sub.security_governance_score,
            "status": sub.status,
            "risk_score": sub.risk_score,
            "risk_tier": sub.risk_tier,
            "missing_flags_count": len(sub.missing_flags),
            "active_lock_user_id": sub.active_lock_user_id,
            "locked_at": sub.locked_at,
            "created_at": sub.created_at,
            "updated_at": sub.updated_at,
            "attachments": attachments,
            "missing_flags": missing_flags,
            "risk_score_breakdowns": risk_score_breakdowns,
            "decision": decision_data,
            "audit_logs": audit_logs,
        }

    @staticmethod
    def set_lock(
        db: Session, submission_id: str, underwriter: User, action: str
    ) -> Dict[str, Any]:
        sub = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.id == submission_id)
            .first()
        )
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")

        action_upper = (action or "").upper()
        if action_upper == "ACQUIRE":
            if sub.active_lock_user_id and sub.active_lock_user_id != underwriter.id:
                locking_user = (
                    db.query(User).filter(User.id == sub.active_lock_user_id).first()
                )
                locker_name = (
                    locking_user.full_name if locking_user else "Another underwriter"
                )
                raise HTTPException(
                    status_code=409,
                    detail=f"Submission is currently locked for review by {locker_name}",
                )

            now_val = datetime.now(timezone.utc)
            sub.active_lock_user_id = underwriter.id
            sub.locked_at = now_val
            if sub.status == "SUBMITTED":
                sub.status = "UNDER_REVIEW"

            db.commit()
            db.refresh(sub)

            AuditService.log_event(
                db=db,
                entity_type="submission",
                entity_id=sub.id,
                action="LOCK_ACQUIRED",
                actor_user_id=underwriter.id,
                actor_role=underwriter.role,
                state_diff={"locked": True, "locked_by": underwriter.full_name},
            )

            return {
                "locked": True,
                "locked_by": underwriter.full_name,
                "locked_at": sub.locked_at,
            }

        elif action_upper == "RELEASE":
            sub.active_lock_user_id = None
            sub.locked_at = None
            if sub.status == "UNDER_REVIEW":
                sub.status = "SUBMITTED"

            db.commit()
            db.refresh(sub)

            AuditService.log_event(
                db=db,
                entity_type="submission",
                entity_id=sub.id,
                action="LOCK_RELEASED",
                actor_user_id=underwriter.id,
                actor_role=underwriter.role,
                state_diff={"locked": False},
            )

            return {
                "locked": False,
                "locked_by": None,
                "locked_at": None,
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid lock action. Must be ACQUIRE or RELEASE.",
            )

    @staticmethod
    def record_decision(
        db: Session,
        submission_id: str,
        underwriter: User,
        data: DecisionCreate,
    ) -> UnderwritingDecision:
        sub = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.id == submission_id)
            .first()
        )
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")

        decision_upper = (data.decision or "").upper()
        if decision_upper not in ["QUOTE", "DECLINE"]:
            raise HTTPException(
                status_code=400, detail="Decision must be either 'QUOTE' or 'DECLINE'"
            )

        if decision_upper == "QUOTE":
            # Check for blocking missing information flags
            blocking_flags = (
                db.query(MissingInformationFlag)
                .filter(
                    MissingInformationFlag.submission_id == submission_id,
                    MissingInformationFlag.severity == "BLOCKING",
                    MissingInformationFlag.is_resolved == False,
                )
                .all()
            )
            if blocking_flags:
                raise HTTPException(
                    status_code=422,
                    detail="Cannot issue formal quote while blocking missing information flags remain unresolved.",
                )

            if not data.capacity_offered or data.capacity_offered <= 0:
                raise HTTPException(
                    status_code=422,
                    detail="Capacity offered is required for a quote and must be greater than zero.",
                )
            if not data.rate_on_line_pct or data.rate_on_line_pct <= 0:
                raise HTTPException(
                    status_code=422,
                    detail="Rate on Line % is required for a quote and must be greater than zero.",
                )

            premium = round(data.capacity_offered * (data.rate_on_line_pct / 100.0), 2)
            sub.status = "QUOTED"

        else:  # DECLINE
            if not data.decline_reason_code:
                raise HTTPException(
                    status_code=422,
                    detail="Standardized decline_reason_code is mandatory when recording a decline decision.",
                )
            if data.decline_reason_code not in VALID_DECLINE_REASONS:
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid decline_reason_code. Must be one of: {', '.join(sorted(VALID_DECLINE_REASONS))}",
                )

            premium = None
            sub.status = "DECLINED"

        # Concurrency lock release
        sub.active_lock_user_id = None
        sub.locked_at = None

        now_val = datetime.now(timezone.utc)
        # Existing or new decision
        dec = (
            db.query(UnderwritingDecision)
            .filter(UnderwritingDecision.submission_id == submission_id)
            .first()
        )
        if not dec:
            dec = UnderwritingDecision(
                id=str(uuid.uuid4()),
                submission_id=submission_id,
                underwriter_id=underwriter.id,
                decision=decision_upper,
                capacity_offered=data.capacity_offered
                if decision_upper == "QUOTE"
                else None,
                rate_on_line_pct=data.rate_on_line_pct
                if decision_upper == "QUOTE"
                else None,
                premium_amount=premium,
                binding_deadline=data.binding_deadline
                if decision_upper == "QUOTE"
                else None,
                subjectivities=data.subjectivities
                if decision_upper == "QUOTE"
                else None,
                decline_reason_code=data.decline_reason_code
                if decision_upper == "DECLINE"
                else None,
                decline_notes=data.decline_notes
                if decision_upper == "DECLINE"
                else None,
                decided_at=now_val,
            )
            db.add(dec)
        else:
            dec.underwriter_id = underwriter.id
            dec.decision = decision_upper
            dec.capacity_offered = (
                data.capacity_offered if decision_upper == "QUOTE" else None
            )
            dec.rate_on_line_pct = (
                data.rate_on_line_pct if decision_upper == "QUOTE" else None
            )
            dec.premium_amount = premium
            dec.binding_deadline = (
                data.binding_deadline if decision_upper == "QUOTE" else None
            )
            dec.subjectivities = (
                data.subjectivities if decision_upper == "QUOTE" else None
            )
            dec.decline_reason_code = (
                data.decline_reason_code if decision_upper == "DECLINE" else None
            )
            dec.decline_notes = (
                data.decline_notes if decision_upper == "DECLINE" else None
            )
            dec.decided_at = now_val

        db.commit()
        db.refresh(dec)
        db.refresh(sub)

        AuditService.log_event(
            db=db,
            entity_type="decision",
            entity_id=dec.id,
            action="DECISION_RECORDED",
            actor_user_id=underwriter.id,
            actor_role=underwriter.role,
            state_diff={
                "submission_id": sub.id,
                "decision": decision_upper,
                "status": sub.status,
                "premium_amount": premium,
                "decline_reason_code": data.decline_reason_code,
            },
        )

        return dec

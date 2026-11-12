import json
import uuid
from typing import List, Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from server.models.submission import Submission
from server.models.evaluation import UnderwritingDecision
from server.schemas.decision import DecisionCreate, DeclineReason
from server.services.audit_service import AuditService

DECLINE_REASONS_CATALOGUE: List[Dict[str, str]] = [
    {
        "code": "HIGH_EXPOSURE_AGGREGATION",
        "label": "High Exposure Aggregation",
        "category": "Exposure / Aggregation",
        "description": "Risk exceeds aggregate portfolio concentration limits or geographical correlation thresholds.",
    },
    {
        "code": "INSUFFICIENT_SECURITY_CONTROLS",
        "label": "Insufficient Security Controls",
        "category": "Cyber Risk",
        "description": "Omission or failure of critical technical safeguards including MFA, EDR, and immutable backups.",
    },
    {
        "code": "ADVERSE_LOSS_HISTORY",
        "label": "Adverse Loss History",
        "category": "Loss History",
        "description": "Unfavorable frequency or severe prior loss record indicates elevated risk profile.",
    },
    {
        "code": "REGULATORY_COMPLIANCE_CONCERN",
        "label": "Regulatory Compliance Concern",
        "category": "Governance & Compliance",
        "description": "Active regulatory inquiries, sanctions, or material governance deficiencies.",
    },
    {
        "code": "CAPACITY_EXCEEDED",
        "label": "Underwriting Capacity Exceeded",
        "category": "Line Limits",
        "description": "Total facultative placement volume exceeds treaty risk retention boundaries.",
    },
    {
        "code": "PRICING_INADEQUACY",
        "label": "Pricing Inadequacy",
        "category": "Financial Terms",
        "description": "Requested ceded premium rate is below technical minimum risk price.",
    },
    {
        "code": "INCOMPLETE_DISCLOSURES",
        "label": "Incomplete Risk Disclosures",
        "category": "Documentation",
        "description": "Carrier failed to supply required audit checklists or underwriting attestations.",
    },
    {
        "code": "HIGH_EXECUTIVE_TURNOVER",
        "label": "Excessive Executive Turnover",
        "category": "Management Risk",
        "description": "High turnover among senior executive officers and board members creates management liability risk.",
    },
    {
        "code": "FINANCIAL_LEVERAGE_EXCESSIVE",
        "label": "Excessive Financial Leverage",
        "category": "Balance Sheet",
        "description": "High debt-to-equity ratio presents substantial corporate insolvency exposure.",
    },
]


class DecisionService:
    @staticmethod
    def get_decline_reasons() -> List[DeclineReason]:
        return [DeclineReason(**item) for item in DECLINE_REASONS_CATALOGUE]

    @staticmethod
    def record_decision(
        db: Session, submission_id: str, data: DecisionCreate
    ) -> UnderwritingDecision:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with id {submission_id} not found",
            )

        decision_type = data.decision_type.upper().strip()

        if decision_type == "DECLINE":
            if not data.decline_reason_code:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="decline_reason_code is required for DECLINE decisions",
                )
            # Verify reason code is in catalogue
            valid_codes = {r["code"] for r in DECLINE_REASONS_CATALOGUE}
            if data.decline_reason_code not in valid_codes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid decline_reason_code '{data.decline_reason_code}'. Must be one of valid codes in catalogue.",
                )

            submission.status = "DECLINED"

            exclusions_str = json.dumps(data.exclusions) if data.exclusions else None
            decision = UnderwritingDecision(
                id=str(uuid.uuid4()),
                submission_id=submission_id,
                decision_type="DECLINE",
                decline_reason_code=data.decline_reason_code,
                decline_notes=data.decline_notes,
                exclusions=exclusions_str,
            )
            db.add(decision)

            AuditService.log_action(
                db=db,
                submission_id=submission_id,
                action="UNDERWRITING_DECLINED",
                details=f"Declined with reason {data.decline_reason_code}: {data.decline_notes or 'No notes'}",
            )

        elif decision_type == "QUOTE":
            submission.status = "QUOTED"

            exclusions_str = json.dumps(data.exclusions) if data.exclusions else None
            decision = UnderwritingDecision(
                id=str(uuid.uuid4()),
                submission_id=submission_id,
                decision_type="QUOTE",
                offered_capacity=data.offered_capacity,
                quoted_rate=data.quoted_rate,
                quoted_premium=data.quoted_premium,
                terms_conditions=data.terms_conditions,
                exclusions=exclusions_str,
            )
            db.add(decision)

            AuditService.log_action(
                db=db,
                submission_id=submission_id,
                action="UNDERWRITING_QUOTED",
                details=f"Quoted capacity {data.offered_capacity} at rate {data.quoted_rate}% (Premium: {data.quoted_premium})",
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid decision_type '{decision_type}'. Must be 'QUOTE' or 'DECLINE'",
            )

        db.commit()
        db.refresh(decision)
        db.refresh(submission)
        return decision

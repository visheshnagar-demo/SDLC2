import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from server.models import UnderwritingDecision, Document
from server.schemas.decision import UnderwritingDecisionCreate


class DecisionService:
    @staticmethod
    def record_decision(
        db: Session, decision_data: UnderwritingDecisionCreate
    ) -> UnderwritingDecision:
        doc = (
            db.query(Document).filter(Document.id == decision_data.document_id).first()
        )
        if not doc:
            raise ValueError(f"Document with ID {decision_data.document_id} not found")

        valid_decisions = {
            "APPROVED",
            "CONDITIONAL_APPROVAL",
            "DECLINED",
            "REFERRED",
        }
        dec_upper = decision_data.decision.upper()
        if dec_upper not in valid_decisions:
            raise ValueError(
                f"Invalid decision '{decision_data.decision}'. Allowed values: {valid_decisions}"
            )

        dec_record = UnderwritingDecision(
            id=str(uuid.uuid4()),
            document_id=decision_data.document_id,
            decision=dec_upper,
            underwriter_id=decision_data.underwriter_id,
            reviewer_notes=decision_data.reviewer_notes,
            subjectivities=decision_data.subjectivities,
        )

        db.add(dec_record)
        db.commit()
        db.refresh(dec_record)
        return dec_record

    @staticmethod
    def list_decisions(
        db: Session, document_id: Optional[str] = None
    ) -> List[UnderwritingDecision]:
        query = db.query(UnderwritingDecision)
        if document_id:
            query = query.filter(UnderwritingDecision.document_id == document_id)
        return query.order_by(UnderwritingDecision.created_at.desc()).all()

    @staticmethod
    def get_decision(db: Session, decision_id: str) -> Optional[UnderwritingDecision]:
        return (
            db.query(UnderwritingDecision)
            .filter(UnderwritingDecision.id == decision_id)
            .first()
        )

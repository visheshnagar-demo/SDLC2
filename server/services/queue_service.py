from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, or_

from server.models import ReinsuranceSubmission
from server.schemas import UnderwritingQueueResponse


class QueueService:
    @staticmethod
    def get_underwriting_queue(
        db: Session,
        status: Optional[str] = None,
        risk_category: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        carrier_name: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        skip: int = 0,
        limit: int = 20,
    ) -> UnderwritingQueueResponse:
        query = db.query(ReinsuranceSubmission).options(
            joinedload(ReinsuranceSubmission.documents),
            joinedload(ReinsuranceSubmission.missing_flags),
            joinedload(ReinsuranceSubmission.decisions),
        )

        if status:
            query = query.filter(ReinsuranceSubmission.status == status.upper().strip())

        if risk_category:
            query = query.filter(
                ReinsuranceSubmission.risk_category == risk_category.upper().strip()
            )

        if priority:
            query = query.filter(
                ReinsuranceSubmission.priority == priority.upper().strip()
            )

        if carrier_name:
            query = query.filter(
                ReinsuranceSubmission.carrier_name.ilike(f"%{carrier_name.strip()}%")
            )

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    ReinsuranceSubmission.submission_reference.ilike(search_term),
                    ReinsuranceSubmission.insured_entity_name.ilike(search_term),
                    ReinsuranceSubmission.carrier_name.ilike(search_term),
                    ReinsuranceSubmission.primary_policy_number.ilike(search_term),
                )
            )

        total = query.count()

        # Sorting
        sort_col = getattr(
            ReinsuranceSubmission, sort_by, ReinsuranceSubmission.created_at
        )
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(sort_col))

        items = query.offset(skip).limit(limit).all()

        return UnderwritingQueueResponse(
            total=total,
            skip=skip,
            limit=limit,
            items=items,
        )

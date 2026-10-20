import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionListResponse,
)
from server.schemas.document import DocumentCreate, DocumentResponse
from server.services.submission_service import (
    create_submission,
    add_document_to_submission,
    get_submission_by_id,
    list_submissions,
)
from server.dependencies.auth import get_current_user
from server.models.user import User

router = APIRouter(prefix="/api/v1/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_new_submission(
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = create_submission(db, submission_in, current_user)
    return get_submission_by_id(db, sub.id, current_user)


@router.get("", response_model=SubmissionListResponse)
def get_submissions_list(
    status: Optional[str] = Query(
        None, description="Filter by status (RECEIVED, IN_REVIEW, etc.)"
    ),
    line_of_business: Optional[str] = Query(
        None, alias="lob", description="Filter by LOB (CYBER, DO, EO, EPLI, MEDMAL)"
    ),
    ceding_org_id: Optional[str] = Query(None, description="Filter by Ceding Org"),
    search: Optional[str] = Query(
        None, description="Search keyword for insured name or submission number"
    ),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    skip: Optional[int] = Query(
        None, ge=0, description="Offset for pagination (overrides page if provided)"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offset = skip if skip is not None else (page - 1) * limit
    items, total = list_submissions(
        db=db,
        current_user=current_user,
        status_filter=status,
        lob_filter=line_of_business,
        ceding_org_id=ceding_org_id,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=offset,
        limit=limit,
    )
    pages = math.ceil(total / limit) if limit > 0 else 1
    return SubmissionListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/{id}", response_model=SubmissionResponse)
def get_submission_details(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_submission_by_id(db, id, current_user)


@router.post(
    "/{id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_submission_document(
    id: str,
    doc_in: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return add_document_to_submission(db, id, doc_in, current_user)

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db, DEFAULT_CLUSTER_ID
from server.models import Cluster
from server.schemas import (
    ClusterResponse,
    ClusterListResponse,
    ClusterKPIResponse,
    SKUListResponse,
    ScenarioListResponse,
    AssortmentSubmissionCreate,
    AssortmentSubmissionResponse,
    SubmissionListResponse,
)
from server.services.kpi_service import get_cluster_kpis
from server.services.sku_service import list_cluster_skus
from server.services.scenario_service import get_cluster_scenarios
from server.services.approval_service import (
    create_submission,
    list_submissions,
    get_submission,
)

router = APIRouter(prefix="/api/v1/clusters", tags=["clusters"])


@router.get("", response_model=ClusterListResponse)
def get_all_clusters(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all available store clusters."""
    query = db.query(Cluster)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return ClusterListResponse(
        total=total,
        items=[
            ClusterResponse(
                id=c.id,
                name=c.name,
                code=c.code,
                category=c.category,
                total_linear_feet=c.total_linear_feet,
                created_at=c.created_at.isoformat() if c.created_at else None,
                updated_at=c.updated_at.isoformat() if c.updated_at else None,
            )
            for c in items
        ],
    )


@router.get("/default", response_model=ClusterResponse)
def get_default_cluster(db: Session = Depends(get_db)):
    """Get the pre-selected default cluster (Small Town Value Cluster)."""
    cluster = db.query(Cluster).filter(Cluster.id == DEFAULT_CLUSTER_ID).first()
    if not cluster:
        cluster = db.query(Cluster).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No clusters found in database",
        )
    return ClusterResponse(
        id=cluster.id,
        name=cluster.name,
        code=cluster.code,
        category=cluster.category,
        total_linear_feet=cluster.total_linear_feet,
        created_at=cluster.created_at.isoformat() if cluster.created_at else None,
        updated_at=cluster.updated_at.isoformat() if cluster.updated_at else None,
    )


@router.get("/{cluster_id}", response_model=ClusterResponse)
def get_cluster(cluster_id: str, db: Session = Depends(get_db)):
    """Get cluster details by ID."""
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID '{cluster_id}' not found",
        )
    return ClusterResponse(
        id=cluster.id,
        name=cluster.name,
        code=cluster.code,
        category=cluster.category,
        total_linear_feet=cluster.total_linear_feet,
        created_at=cluster.created_at.isoformat() if cluster.created_at else None,
        updated_at=cluster.updated_at.isoformat() if cluster.updated_at else None,
    )


@router.get("/{cluster_id}/kpis", response_model=ClusterKPIResponse)
def get_cluster_kpi_metrics(cluster_id: str, db: Session = Depends(get_db)):
    """Get real-time KPI metrics for a cluster."""
    return get_cluster_kpis(db=db, cluster_id=cluster_id)


@router.get("/{cluster_id}/skus", response_model=SKUListResponse)
def get_cluster_sku_performance(
    cluster_id: str,
    status_badge: Optional[str] = Query(None, description="Filter by GROW, MAINTAIN, SWAP, REDUCE"),
    sub_category: Optional[str] = Query(None, description="Filter by sub-category e.g. Chips, Pretzels"),
    is_private_brand: Optional[bool] = Query(None, description="Filter by private brand status"),
    search: Optional[str] = Query(None, description="Search by name, brand, or SKU code"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List SKU performance data with status badges and metrics."""
    return list_cluster_skus(
        db=db,
        cluster_id=cluster_id,
        status_badge=status_badge,
        sub_category=sub_category,
        is_private_brand=is_private_brand,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/{cluster_id}/scenarios", response_model=ScenarioListResponse)
def get_cluster_scenario_options(cluster_id: str, db: Session = Depends(get_db)):
    """Retrieve 3 scenario simulation options with projected deltas and action counts."""
    return get_cluster_scenarios(db=db, cluster_id=cluster_id)


@router.post(
    "/{cluster_id}/submissions",
    response_model=AssortmentSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_assortment_decision(
    cluster_id: str,
    payload: AssortmentSubmissionCreate,
    db: Session = Depends(get_db),
):
    """Submit approved assortment plan, evaluate guardrails, and generate audit record."""
    return create_submission(db=db, cluster_id=cluster_id, payload=payload)


@router.get("/{cluster_id}/submissions", response_model=SubmissionListResponse)
def get_cluster_submissions(
    cluster_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List historical assortment submissions / audit trails for a cluster."""
    return list_submissions(db=db, cluster_id=cluster_id, skip=skip, limit=limit)


@router.get(
    "/{cluster_id}/submissions/{submission_id}",
    response_model=AssortmentSubmissionResponse,
)
def get_single_submission(
    cluster_id: str, submission_id: str, db: Session = Depends(get_db)
):
    """Get details of a specific audit submission."""
    return get_submission(db=db, cluster_id=cluster_id, submission_id=submission_id)

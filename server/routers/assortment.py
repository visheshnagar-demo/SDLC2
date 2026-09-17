import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.assortment import (
    SKUModel,
    ScenarioProjectionModel,
    AssortmentSubmissionModel,
)
from server.schemas.assortment import (
    SKUResponse,
    ScenariosResponse,
    ScenarioDetail,
    ActionCounts,
    MetricsResponse,
    SubmitRequest,
    SubmitResponse,
    SubmissionSummary,
    SubmissionRecordResponse,
)

router = APIRouter(prefix="/api/v1/assortment", tags=["Assortment Advisor"])


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(
    scenario: Optional[str] = Query(
        None, description="Optional scenario key (conservative, balanced, aggressive)"
    ),
    db: Session = Depends(get_db),
):
    """
    Fetch baseline summary KPIs or scenario-adjusted summary metrics.
    """
    if scenario:
        sc_obj = (
            db.query(ScenarioProjectionModel)
            .filter(ScenarioProjectionModel.scenario_key == scenario.lower())
            .first()
        )
        if not sc_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scenario '{scenario}' not found.",
            )
        return MetricsResponse(
            sales_per_linear_ft=sc_obj.projected_sales_per_linear_ft,
            private_brand_pct=sc_obj.projected_private_brand_pct,
            in_stock_rate_pct=sc_obj.projected_in_stock_rate_pct,
            shelf_capacity_pct=sc_obj.projected_shelf_capacity_pct,
            is_projected=True,
        )

    # Compute baseline metrics from SKU records
    skus = db.query(SKUModel).all()
    if not skus:
        return MetricsResponse(
            sales_per_linear_ft=450.00,
            private_brand_pct=28.5,
            in_stock_rate_pct=96.2,
            shelf_capacity_pct=92.0,
            is_projected=False,
        )

    total_sales = sum(s.weekly_sales for s in skus)
    total_shelf = sum(s.shelf_space_ft for s in skus)
    sales_per_ft = round(total_sales / total_shelf, 2) if total_shelf > 0 else 450.00

    pb_count = sum(1 for s in skus if s.is_private_brand)
    total_count = len(skus)
    pb_pct = round((pb_count / total_count) * 100, 1) if total_count > 0 else 28.5

    return MetricsResponse(
        sales_per_linear_ft=sales_per_ft,
        private_brand_pct=pb_pct,
        in_stock_rate_pct=96.2,
        shelf_capacity_pct=92.0,
        is_projected=False,
    )


@router.get("/skus", response_model=List[SKUResponse])
def get_skus(
    category: Optional[str] = Query(None, description="Filter by category"),
    badge: Optional[str] = Query(
        None, description="Filter by status badge (GROW, MAINTAIN, SWAP, REDUCE)"
    ),
    db: Session = Depends(get_db),
):
    """
    Fetch list of SKUs with optional category and status badge filtering.
    """
    query = db.query(SKUModel)
    if category:
        query = query.filter(SKUModel.category.ilike(f"%{category}%"))
    if badge:
        query = query.filter(SKUModel.status_badge.ilike(badge))

    skus = query.order_by(SKUModel.sku_code).all()
    return skus


@router.get("/scenarios", response_model=ScenariosResponse)
def get_scenarios(db: Session = Depends(get_db)):
    """
    Fetch definitions and projections for Conservative, Balanced, and Aggressive scenarios.
    """
    scenarios_db = db.query(ScenarioProjectionModel).all()

    # Pre-defined sort order
    order_map = {"conservative": 1, "balanced": 2, "aggressive": 3}
    sorted_scenarios = sorted(
        scenarios_db, key=lambda s: order_map.get(s.scenario_key.lower(), 99)
    )

    result_list = []
    for sc in sorted_scenarios:
        result_list.append(
            ScenarioDetail(
                scenario_key=sc.scenario_key,
                display_name=sc.display_name,
                description=sc.description,
                projected_sales_per_linear_ft=sc.projected_sales_per_linear_ft,
                projected_private_brand_pct=sc.projected_private_brand_pct,
                projected_in_stock_rate_pct=sc.projected_in_stock_rate_pct,
                projected_shelf_capacity_pct=sc.projected_shelf_capacity_pct,
                action_counts=ActionCounts(
                    GROW=sc.action_grow_count,
                    MAINTAIN=sc.action_maintain_count,
                    SWAP=sc.action_swap_count,
                    REDUCE=sc.action_reduce_count,
                ),
            )
        )

    return ScenariosResponse(active_default="balanced", scenarios=result_list)


@router.post(
    "/submit", response_model=SubmitResponse, status_code=status.HTTP_201_CREATED
)
def submit_assortment_plan(
    payload: SubmitRequest,
    db: Session = Depends(get_db),
):
    """
    Validate guardrails server-side, format audit confirmation ID, and persist submission snapshot.
    """
    scenario_key = payload.scenario_key.lower().strip()
    sc_obj = (
        db.query(ScenarioProjectionModel)
        .filter(ScenarioProjectionModel.scenario_key == scenario_key)
        .first()
    )

    if not sc_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario key '{payload.scenario_key}'. Must be 'conservative', 'balanced', or 'aggressive'.",
        )

    # Guardrail Check: Minimum 25.0% Private Brand percentage required
    MIN_PRIVATE_BRAND_PCT = 25.0
    if sc_obj.projected_private_brand_pct < MIN_PRIVATE_BRAND_PCT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Guardrail Check Failed: Private Brand percentage ({sc_obj.projected_private_brand_pct}%) is below required minimum threshold of {MIN_PRIVATE_BRAND_PCT}%.",
        )

    # Generate Audit Confirmation ID: AUD-YYYY-XXXXX
    current_year = datetime.utcnow().year
    random_suffix = random.randint(10000, 99999)
    audit_id = f"AUD-{current_year}-{random_suffix}"

    # Capture point-in-time snapshot of SKUs
    skus = db.query(SKUModel).all()
    sku_snapshot = [
        {
            "sku_code": s.sku_code,
            "product_name": s.product_name,
            "category": s.category,
            "status_badge": s.status_badge,
            "is_private_brand": s.is_private_brand,
            "weekly_sales": s.weekly_sales,
            "margin_pct": s.margin_pct,
            "shelf_space_ft": s.shelf_space_ft,
        }
        for s in skus
    ]

    audit_trail_json = {
        "scenario_key": sc_obj.scenario_key,
        "scenario_name": sc_obj.display_name,
        "user_id": payload.user_id,
        "justification_note": payload.justification_note,
        "guardrail_status": "PASSED",
        "projected_metrics": {
            "sales_per_linear_ft": sc_obj.projected_sales_per_linear_ft,
            "private_brand_pct": sc_obj.projected_private_brand_pct,
            "in_stock_rate_pct": sc_obj.projected_in_stock_rate_pct,
            "shelf_capacity_pct": sc_obj.projected_shelf_capacity_pct,
        },
        "action_counts": {
            "GROW": sc_obj.action_grow_count,
            "MAINTAIN": sc_obj.action_maintain_count,
            "SWAP": sc_obj.action_swap_count,
            "REDUCE": sc_obj.action_reduce_count,
        },
        "total_skus_reviewed": len(skus),
        "skus_snapshot": sku_snapshot,
    }

    submission = AssortmentSubmissionModel(
        audit_confirmation_id=audit_id,
        scenario_key=sc_obj.scenario_key,
        scenario_name=sc_obj.display_name,
        user_id=payload.user_id,
        justification_note=payload.justification_note,
        guardrail_status="PASSED",
        audit_trail_json=audit_trail_json,
        created_at=datetime.utcnow(),
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return SubmitResponse(
        status="SUCCESS",
        audit_confirmation_id=submission.audit_confirmation_id,
        submitted_at=submission.created_at,
        scenario_name=submission.scenario_name,
        user_id=submission.user_id,
        guardrail_status="PASSED",
        summary=SubmissionSummary(
            projected_sales_per_linear_ft=sc_obj.projected_sales_per_linear_ft,
            projected_private_brand_pct=sc_obj.projected_private_brand_pct,
            total_skus_reviewed=len(skus),
        ),
    )


@router.get("/submissions", response_model=List[SubmissionRecordResponse])
def get_submissions(db: Session = Depends(get_db)):
    """
    Retrieve all audit submission records.
    """
    return (
        db.query(AssortmentSubmissionModel)
        .order_by(AssortmentSubmissionModel.created_at.desc())
        .all()
    )

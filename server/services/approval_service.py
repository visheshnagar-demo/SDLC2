import hashlib
import json
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models import Cluster, Scenario, AssortmentSubmission
from server.schemas import (
    AssortmentSubmissionCreate,
    AssortmentSubmissionResponse,
    SkuActionSummaryDict,
    SubmissionListResponse,
)


def create_submission(
    db: Session, cluster_id: str, payload: AssortmentSubmissionCreate
) -> AssortmentSubmissionResponse:
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID '{cluster_id}' not found",
        )

    scenario = (
        db.query(Scenario)
        .filter(
            Scenario.id == payload.scenario_id,
            Scenario.cluster_id == cluster_id,
        )
        .first()
    )
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario with ID '{payload.scenario_id}' not found for cluster '{cluster_id}'",
        )

    now_utc = datetime.now(timezone.utc)
    now_iso = now_utc.isoformat()

    # Generate unique Audit Reference: e.g. AUD-2026-XXXX
    rand_suffix = random.randint(1000, 9999)
    audit_ref = f"AUD-{now_utc.year}-{rand_suffix}"

    # Ensure uniqueness of audit reference
    while db.query(AssortmentSubmission).filter(AssortmentSubmission.audit_reference == audit_ref).first():
        rand_suffix = random.randint(1000, 9999)
        audit_ref = f"AUD-{now_utc.year}-{rand_suffix}"

    sku_action_summary = {
        "adds": scenario.add_count,
        "keeps": scenario.keep_count,
        "swaps": scenario.swap_count,
        "removes": scenario.remove_count,
    }

    audit_payload_data = {
        "audit_reference": audit_ref,
        "cluster_id": cluster.id,
        "cluster_name": cluster.name,
        "scenario_id": scenario.id,
        "scenario_type": scenario.scenario_type,
        "submitted_by_user": payload.submitted_by_user,
        "guardrail_status": scenario.overall_guardrail_status,
        "sku_actions": sku_action_summary,
        "submitted_at": now_iso,
        "notes": payload.notes,
    }

    raw_bytes = json.dumps(audit_payload_data, sort_keys=True).encode("utf-8")
    checksum = f"sha256:{hashlib.sha256(raw_bytes).hexdigest()}"

    submission = AssortmentSubmission(
        cluster_id=cluster.id,
        scenario_id=scenario.id,
        scenario_type=scenario.scenario_type,
        audit_reference=audit_ref,
        submitted_by_user=payload.submitted_by_user,
        notes=payload.notes,
        guardrail_status=scenario.overall_guardrail_status,
        checksum=checksum,
        audit_summary_json=json.dumps(audit_payload_data),
        status="CONFIRMED",
        created_at=now_utc,
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return AssortmentSubmissionResponse(
        submission_id=submission.id,
        audit_reference=submission.audit_reference,
        cluster_id=submission.cluster_id,
        scenario_type=submission.scenario_type,
        submitted_by=submission.submitted_by_user,
        submitted_at=now_iso,
        guardrail_status=submission.guardrail_status,
        sku_action_summary=SkuActionSummaryDict(**sku_action_summary),
        status=submission.status,
        checksum=submission.checksum,
        notes=submission.notes,
    )


def list_submissions(
    db: Session, cluster_id: str, skip: int = 0, limit: int = 20
) -> SubmissionListResponse:
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID '{cluster_id}' not found",
        )

    query = db.query(AssortmentSubmission).filter(
        AssortmentSubmission.cluster_id == cluster_id
    )
    total = query.count()
    items = (
        query.order_by(AssortmentSubmission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for sub in items:
        action_data = {"adds": 0, "keeps": 0, "swaps": 0, "removes": 0}
        if sub.audit_summary_json:
            try:
                parsed = json.loads(sub.audit_summary_json)
                action_data = parsed.get("sku_actions", action_data)
            except Exception:
                pass

        results.append(
            AssortmentSubmissionResponse(
                submission_id=sub.id,
                audit_reference=sub.audit_reference,
                cluster_id=sub.cluster_id,
                scenario_type=sub.scenario_type,
                submitted_by=sub.submitted_by_user,
                submitted_at=(
                    sub.created_at.isoformat()
                    if sub.created_at
                    else datetime.now(timezone.utc).isoformat()
                ),
                guardrail_status=sub.guardrail_status,
                sku_action_summary=SkuActionSummaryDict(**action_data),
                status=sub.status,
                checksum=sub.checksum,
                notes=sub.notes,
            )
        )

    return SubmissionListResponse(total=total, items=results)


def get_submission(
    db: Session, cluster_id: str, submission_id: str
) -> AssortmentSubmissionResponse:
    submission = (
        db.query(AssortmentSubmission)
        .filter(
            AssortmentSubmission.id == submission_id,
            AssortmentSubmission.cluster_id == cluster_id,
        )
        .first()
    )
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission with ID '{submission_id}' not found for cluster '{cluster_id}'",
        )

    action_data = {"adds": 0, "keeps": 0, "swaps": 0, "removes": 0}
    if submission.audit_summary_json:
        try:
            parsed = json.loads(submission.audit_summary_json)
            action_data = parsed.get("sku_actions", action_data)
        except Exception:
            pass

    return AssortmentSubmissionResponse(
        submission_id=submission.id,
        audit_reference=submission.audit_reference,
        cluster_id=submission.cluster_id,
        scenario_type=submission.scenario_type,
        submitted_by=submission.submitted_by_user,
        submitted_at=(
            submission.created_at.isoformat()
            if submission.created_at
            else datetime.now(timezone.utc).isoformat()
        ),
        guardrail_status=submission.guardrail_status,
        sku_action_summary=SkuActionSummaryDict(**action_data),
        status=submission.status,
        checksum=submission.checksum,
        notes=submission.notes,
    )

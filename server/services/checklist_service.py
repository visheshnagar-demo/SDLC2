from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from server.models import ReinsuranceSubmission, SubmissionDocument, MissingInfoFlag


def evaluate_checklist(db: Session, submission_id: str) -> List[MissingInfoFlag]:
    """Check submission fields and documents against required risk guidelines; create/update flags."""
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        return []

    docs = db.query(SubmissionDocument).filter_by(submission_id=submission_id).all()
    doc_types = {d.document_type.upper() for d in docs}

    risk_type = (submission.risk_type or "").upper()
    risk_attrs = submission.risk_attributes or {}

    expected_checks: List[Dict[str, Any]] = []

    # 1. Common required field checks
    if not submission.insured_name or not submission.insured_name.strip():
        expected_checks.append(
            {
                "flag_type": "FIELD",
                "field_or_doc_name": "insured_name",
                "description": "Insured legal entity name is required.",
            }
        )

    if not submission.limit_requested or submission.limit_requested <= 0:
        expected_checks.append(
            {
                "flag_type": "FIELD",
                "field_or_doc_name": "limit_requested",
                "description": "Requested reinsurance policy limit must be greater than zero.",
            }
        )

    if submission.attachment_point is None or submission.attachment_point < 0:
        expected_checks.append(
            {
                "flag_type": "FIELD",
                "field_or_doc_name": "attachment_point",
                "description": "Attachment point must be specified (cannot be negative).",
            }
        )

    if not submission.retention or submission.retention <= 0:
        expected_checks.append(
            {
                "flag_type": "FIELD",
                "field_or_doc_name": "retention",
                "description": "Underlying primary retention must be greater than zero.",
            }
        )

    if not submission.effective_date or not submission.expiry_date:
        expected_checks.append(
            {
                "flag_type": "FIELD",
                "field_or_doc_name": "policy_period",
                "description": "Effective and Expiration dates must be provided.",
            }
        )

    # Common Document Check
    has_loss_run = any("LOSS_RUN" in dt or "LOSS_HISTORY" in dt for dt in doc_types)
    if not has_loss_run:
        expected_checks.append(
            {
                "flag_type": "DOCUMENT",
                "field_or_doc_name": "LOSS_RUN",
                "description": "5-Year Certified Loss Runs schedule document is required.",
            }
        )

    # 2. Risk Type Specific Checks
    if risk_type == "CYBER":
        # Cyber Field Checks
        if "mfa_enabled" not in risk_attrs:
            expected_checks.append(
                {
                    "flag_type": "FIELD",
                    "field_or_doc_name": "mfa_enabled",
                    "description": "Multi-Factor Authentication (MFA) implementation status is missing.",
                }
            )
        if "backup_frequency" not in risk_attrs:
            expected_checks.append(
                {
                    "flag_type": "FIELD",
                    "field_or_doc_name": "backup_frequency",
                    "description": "Data backup schedule and immutability status is required.",
                }
            )

        # Cyber Document Checks
        has_security_doc = any(
            "SECURITY" in dt or "SOC" in dt or "AUDIT" in dt for dt in doc_types
        )
        if not has_security_doc:
            expected_checks.append(
                {
                    "flag_type": "DOCUMENT",
                    "field_or_doc_name": "SECURITY_AUDIT",
                    "description": "Third-Party Cybersecurity Assessment or SOC2 Type II Audit Report is missing.",
                }
            )

    elif risk_type in ["D_AND_O", "D&O"]:
        # D&O Field Checks
        if "pending_litigation" not in risk_attrs:
            expected_checks.append(
                {
                    "flag_type": "FIELD",
                    "field_or_doc_name": "pending_litigation",
                    "description": "Disclosure of pending/threatened management litigation is required.",
                }
            )

        # D&O Document Checks
        has_financials = any(
            "FINANCIAL" in dt or "ANNUAL_REPORT" in dt or "10K" in dt
            for dt in doc_types
        )
        if not has_financials:
            expected_checks.append(
                {
                    "flag_type": "DOCUMENT",
                    "field_or_doc_name": "FINANCIAL_STATEMENT",
                    "description": "Audited Annual Financial Statements or SEC Form 10-K filing is required.",
                }
            )

    # 3. Synchronize flags with DB
    existing_flags = (
        db.query(MissingInfoFlag).filter_by(submission_id=submission_id).all()
    )
    existing_flag_map = {f.field_or_doc_name: f for f in existing_flags}

    expected_names = {c["field_or_doc_name"] for c in expected_checks}

    # Add or un-resolve flags
    for check in expected_checks:
        name = check["field_or_doc_name"]
        if name in existing_flag_map:
            flag = existing_flag_map[name]
            flag.is_resolved = False
            flag.resolved_at = None
            flag.description = check["description"]
        else:
            new_flag = MissingInfoFlag(
                submission_id=submission_id,
                flag_type=check["flag_type"],
                field_or_doc_name=name,
                description=check["description"],
                is_resolved=False,
            )
            db.add(new_flag)

    # Mark resolved flags for items that are no longer failing
    for name, flag in existing_flag_map.items():
        if name not in expected_names and not flag.is_resolved:
            flag.is_resolved = True
            flag.resolved_at = datetime.utcnow()

    db.commit()

    return db.query(MissingInfoFlag).filter_by(submission_id=submission_id).all()


def resolve_single_flag(db: Session, flag_id: str) -> bool:
    """Manually resolve a specific missing info flag."""
    flag = db.query(MissingInfoFlag).filter_by(id=flag_id).first()
    if not flag:
        return False
    flag.is_resolved = True
    flag.resolved_at = datetime.utcnow()
    db.commit()
    return True

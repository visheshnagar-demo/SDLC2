from typing import List, Dict, Any, Optional
from server.models import ReinsuranceSubmission, RiskProfile, SubmissionDocument


def evaluate_missing_information(
    submission: ReinsuranceSubmission,
    risk_profile: Optional[RiskProfile] = None,
    documents: Optional[List[SubmissionDocument]] = None,
) -> List[Dict[str, Any]]:
    """
    Evaluates mandatory and recommended checklist items for Cyber and D&O facultative submissions.
    Returns a list of missing information flags.
    """
    flags: List[Dict[str, Any]] = []
    docs = documents or []
    doc_types = {d.document_type.upper() for d in docs} if docs else set()

    # General checks for all submissions
    if not submission.annual_revenue or submission.annual_revenue <= 0:
        flags.append(
            {
                "field_name": "annual_revenue",
                "flag_severity": "HIGH",
                "description": "Annual revenue disclosure is missing or invalid ($0).",
            }
        )

    if not submission.primary_policy_limit or submission.primary_policy_limit <= 0:
        flags.append(
            {
                "field_name": "primary_policy_limit",
                "flag_severity": "HIGH",
                "description": "Primary policy underlying limit must be greater than zero.",
            }
        )

    if (
        not submission.requested_reinsurance_limit
        or submission.requested_reinsurance_limit <= 0
    ):
        flags.append(
            {
                "field_name": "requested_reinsurance_limit",
                "flag_severity": "HIGH",
                "description": "Requested reinsurance capacity limit must be greater than zero.",
            }
        )

    if not any("PRIMARY_POLICY" in dt or "SCHEDULE" in dt for dt in doc_types):
        flags.append(
            {
                "field_name": "primary_policy_schedule",
                "flag_severity": "HIGH",
                "description": "Underlying primary policy schedule or slip attachment is required.",
            }
        )

    risk_type = (submission.risk_type or "").upper()

    if risk_type == "CYBER":
        # Cyber specific checks
        if not risk_profile or risk_profile.mfa_enforced is None:
            flags.append(
                {
                    "field_name": "mfa_enforcement",
                    "flag_severity": "HIGH",
                    "description": "Multi-Factor Authentication (MFA) enforcement status is not declared.",
                }
            )
        elif not risk_profile.mfa_enforced:
            flags.append(
                {
                    "field_name": "mfa_enforcement",
                    "flag_severity": "HIGH",
                    "description": "Multi-Factor Authentication (MFA) is not enforced across administrative and remote access points.",
                }
            )

        if not risk_profile or risk_profile.has_offline_backups is None:
            flags.append(
                {
                    "field_name": "offline_backups",
                    "flag_severity": "MEDIUM",
                    "description": "Immutable offline/air-gapped backup protocol disclosure is missing.",
                }
            )
        elif not risk_profile.has_offline_backups:
            flags.append(
                {
                    "field_name": "offline_backups",
                    "flag_severity": "MEDIUM",
                    "description": "Insured does not maintain immutable or air-gapped offline backups against ransomware.",
                }
            )

        if not risk_profile or not risk_profile.security_framework:
            flags.append(
                {
                    "field_name": "security_framework",
                    "flag_severity": "LOW",
                    "description": "Recognized cybersecurity governance framework (SOC2, ISO27001, NIST) disclosure is omitted.",
                }
            )

        # Loss history check
        has_loss_run_doc = any("LOSS" in dt for dt in doc_types)
        if not has_loss_run_doc and (
            not risk_profile or risk_profile.prior_losses_count > 0
        ):
            flags.append(
                {
                    "field_name": "loss_history_declaration",
                    "flag_severity": "HIGH",
                    "description": "Signed 3-year loss history declaration document missing.",
                }
            )

    elif risk_type in ("D_AND_O", "D&O"):
        # D&O specific checks
        has_financials_doc = any(
            "FINANCIAL" in dt or "BALANCE" in dt or "AUDIT" in dt for dt in doc_types
        )
        if not has_financials_doc:
            flags.append(
                {
                    "field_name": "financial_disclosures",
                    "flag_severity": "HIGH",
                    "description": "Audited balance sheet or latest financial statements attachment missing.",
                }
            )

        if not risk_profile or risk_profile.has_pending_claims is None:
            flags.append(
                {
                    "field_name": "pending_litigation_statement",
                    "flag_severity": "HIGH",
                    "description": "Pending regulatory inquiry or shareholder litigation declaration is missing.",
                }
            )

        has_governance_doc = any(
            "GOVERNANCE" in dt or "BOARD" in dt or "ROSTER" in dt for dt in doc_types
        )
        if not has_governance_doc:
            flags.append(
                {
                    "field_name": "board_governance_roster",
                    "flag_severity": "MEDIUM",
                    "description": "Board of Directors roster and governance committee structure document missing.",
                }
            )

        # Loss run check
        has_loss_run_doc = any("LOSS" in dt for dt in doc_types)
        if not has_loss_run_doc:
            flags.append(
                {
                    "field_name": "loss_history_declaration",
                    "flag_severity": "HIGH",
                    "description": "5-year D&O claims run / loss declaration schedule missing.",
                }
            )

    return flags

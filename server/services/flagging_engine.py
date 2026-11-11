from typing import List, Dict, Any
from server.models.submission import Submission
from server.models.risk_profile import CyberRiskProfile, DoRiskProfile


def generate_missing_info_flags(submission: Submission) -> List[Dict[str, Any]]:
    """
    Validates submission against mandatory field checklists for Cyber and D&O.
    Returns list of dicts: [{"field_name": ..., "flag_code": ..., "description": ..., "severity": ...}]
    """
    flags = []

    if submission.risk_type == "CYBER":
        profile: CyberRiskProfile = submission.cyber_profile
        if not profile:
            flags.append(
                {
                    "field_name": "cyber_profile",
                    "flag_code": "CYBER_PROFILE_MISSING",
                    "description": "Mandatory Cyber risk profile disclosure is missing.",
                    "severity": "CRITICAL",
                }
            )
            return flags

        if not profile.has_mfa_admin_accounts:
            flags.append(
                {
                    "field_name": "has_mfa_admin_accounts",
                    "flag_code": "CYBER_MFA_ADMIN_MISSING",
                    "description": "Multi-Factor Authentication (MFA) is not enforced on privileged/administrator accounts.",
                    "severity": "CRITICAL",
                }
            )
        if not profile.has_mfa_email:
            flags.append(
                {
                    "field_name": "has_mfa_email",
                    "flag_code": "CYBER_MFA_EMAIL_MISSING",
                    "description": "Multi-Factor Authentication (MFA) is not enforced on corporate email.",
                    "severity": "WARNING",
                }
            )
        if not profile.has_mfa_remote_access:
            flags.append(
                {
                    "field_name": "has_mfa_remote_access",
                    "flag_code": "CYBER_MFA_REMOTE_MISSING",
                    "description": "Multi-Factor Authentication (MFA) is not enforced on remote/VPN access.",
                    "severity": "WARNING",
                }
            )
        if not profile.has_immutable_backups:
            flags.append(
                {
                    "field_name": "has_immutable_backups",
                    "flag_code": "CYBER_BACKUPS_MISSING",
                    "description": "Immutable / air-gapped backup controls are absent or unverified.",
                    "severity": "CRITICAL",
                }
            )
        if not profile.has_edr_deployed:
            flags.append(
                {
                    "field_name": "has_edr_deployed",
                    "flag_code": "CYBER_EDR_MISSING",
                    "description": "Endpoint Detection & Response (EDR) is not deployed across corporate endpoints.",
                    "severity": "WARNING",
                }
            )

    elif submission.risk_type == "DO":
        profile: DoRiskProfile = submission.do_profile
        if not profile:
            flags.append(
                {
                    "field_name": "do_profile",
                    "flag_code": "DO_PROFILE_MISSING",
                    "description": "Mandatory D&O risk profile disclosure is missing.",
                    "severity": "CRITICAL",
                }
            )
            return flags

        if not profile.has_board_oversight_charter:
            flags.append(
                {
                    "field_name": "has_board_oversight_charter",
                    "flag_code": "DO_BOARD_CHARTER_MISSING",
                    "description": "Independent board oversight charter is missing.",
                    "severity": "CRITICAL",
                }
            )
        if profile.pending_litigation_flag:
            flags.append(
                {
                    "field_name": "pending_litigation_flag",
                    "flag_code": "DO_LITIGATION_DISCLOSURE_REQUIRED",
                    "description": "Active pending litigation or regulatory inquiries disclosed - detailed legal filings required.",
                    "severity": "WARNING",
                }
            )
        if profile.debt_to_equity_ratio > 3.0:
            flags.append(
                {
                    "field_name": "debt_to_equity_ratio",
                    "flag_code": "DO_HIGH_LEVERAGE_FLAG",
                    "description": "Debt-to-equity ratio exceeds 3.0x - audited balance sheet disclosure required.",
                    "severity": "WARNING",
                }
            )
        if profile.prior_securities_claims > 0:
            flags.append(
                {
                    "field_name": "prior_securities_claims",
                    "flag_code": "DO_LOSS_RUN_REQUIRED",
                    "description": "Prior securities class actions reported - 5-year detailed loss run required.",
                    "severity": "WARNING",
                }
            )

    return flags

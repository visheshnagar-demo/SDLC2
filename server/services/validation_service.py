from typing import List, Dict, Any, Optional


def scan_missing_info(
    risk_type: str,
    submission_data: Dict[str, Any],
    attachments: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    flags = []
    risk_type_normalized = (risk_type or "").upper()
    params = submission_data.get("risk_parameters") or {}
    attachment_list = attachments or []

    # Helper function to check if a doc type is attached or checked in payload
    def has_doc(keywords: List[str], param_flag: Optional[str] = None) -> bool:
        if param_flag and params.get(param_flag) is True:
            return True
        for att in attachment_list:
            att_lower = str(att).lower()
            if any(k.lower() in att_lower for k in keywords):
                return True
        return False

    # 1. Base mandatory fields
    if not submission_data.get("carrier_id"):
        flags.append({
            "item_key": "carrier_id",
            "item_category": "FIELD",
            "description": "Carrier ID is missing or empty.",
            "severity": "BLOCKING",
            "is_resolved": False,
        })

    if not submission_data.get("insured_name"):
        flags.append({
            "item_key": "insured_name",
            "item_category": "FIELD",
            "description": "Primary Insured Name is required.",
            "severity": "BLOCKING",
            "is_resolved": False,
        })

    if not submission_data.get("requested_limit") or float(submission_data.get("requested_limit", 0)) <= 0:
        flags.append({
            "item_key": "requested_limit",
            "item_category": "FIELD",
            "description": "Requested Reinsurance Limit must be greater than zero.",
            "severity": "BLOCKING",
            "is_resolved": False,
        })

    if submission_data.get("attachment_point") is None or float(submission_data.get("attachment_point", 0)) < 0:
        flags.append({
            "item_key": "attachment_point",
            "item_category": "FIELD",
            "description": "Attachment Point must be a valid non-negative amount.",
            "severity": "BLOCKING",
            "is_resolved": False,
        })

    # 2. Risk Line Specific Validations
    if risk_type_normalized == "CYBER":
        # Ransomware Questionnaire
        if not has_doc(["ransomware", "questionnaire"], "has_ransomware_questionnaire"):
            flags.append({
                "item_key": "ransomware_questionnaire",
                "item_category": "DOCUMENT",
                "description": "Mandatory Cyber Ransomware & Supplemental Questionnaire is missing.",
                "severity": "BLOCKING",
                "is_resolved": False,
            })

        # Security Audit Report
        if not has_doc(["audit", "security", "soc2", "iso"], "has_security_audit_report"):
            flags.append({
                "item_key": "security_audit_report",
                "item_category": "DOCUMENT",
                "description": "Independent Security Audit Report (SOC2 / ISO / Pen Test) is required.",
                "severity": "WARNING",
                "is_resolved": False,
            })

        # 3-Year Cyber Loss Runs
        if not has_doc(["loss_runs", "loss run", "claims_history"], "has_loss_runs_3yr"):
            flags.append({
                "item_key": "cyber_loss_runs_3yr",
                "item_category": "DOCUMENT",
                "description": "Historical 3-Year Verified Cyber Loss Runs are missing.",
                "severity": "BLOCKING",
                "is_resolved": False,
            })

        # MFA Enforced check
        if params.get("mfa_enforced") is None:
            flags.append({
                "item_key": "mfa_enforced",
                "item_category": "ATTESTATION",
                "description": "MFA deployment status across enterprise email and remote access is unconfirmed.",
                "severity": "WARNING",
                "is_resolved": False,
            })

        # EDR Deployed check
        if params.get("edr_deployed") is None:
            flags.append({
                "item_key": "edr_deployed",
                "item_category": "ATTESTATION",
                "description": "Endpoint Detection and Response (EDR) deployment is unconfirmed.",
                "severity": "WARNING",
                "is_resolved": False,
            })

    elif risk_type_normalized == "D_AND_O":
        # Audited Financial Statements
        if not has_doc(["financial", "10k", "audit", "balance_sheet"], "has_audited_financials"):
            flags.append({
                "item_key": "audited_financial_statements",
                "item_category": "DOCUMENT",
                "description": "Latest Audited Financial Statements / Balance Sheet is required.",
                "severity": "BLOCKING",
                "is_resolved": False,
            })

        # 3-Year D&O Loss Runs
        if not has_doc(["loss_runs", "loss run", "claims_history"], "has_loss_runs_3yr"):
            flags.append({
                "item_key": "dno_loss_runs_3yr",
                "item_category": "DOCUMENT",
                "description": "Historical 3-Year D&O Loss Runs and Litigation history are missing.",
                "severity": "BLOCKING",
                "is_resolved": False,
            })

        # Corporate Governance Statement
        if not has_doc(["governance", "board", "proxy"], "has_governance_statement"):
            flags.append({
                "item_key": "corporate_governance_statement",
                "item_category": "DOCUMENT",
                "description": "Corporate Governance Statement / Board Charter is missing.",
                "severity": "WARNING",
                "is_resolved": False,
            })

        # Debt to equity check
        if params.get("debt_to_equity_ratio") is None:
            flags.append({
                "item_key": "debt_to_equity_ratio",
                "item_category": "FIELD",
                "description": "Solvency metric Debt-to-Equity ratio has not been supplied.",
                "severity": "WARNING",
                "is_resolved": False,
            })

        # Independent board check
        if params.get("independent_board_pct") is None:
            flags.append({
                "item_key": "independent_board_pct",
                "item_category": "FIELD",
                "description": "Percentage of independent board directors is unstated.",
                "severity": "WARNING",
                "is_resolved": False,
            })

    return flags

from typing import List, Dict, Any, Optional
from server import models


class MissingInformationFlaggingEngine:
    """
    Evaluates mandatory checklist items per risk type and identifies missing info flags.
    """

    @classmethod
    def evaluate_flags(
        cls,
        submission: models.ReinsuranceSubmission,
        profile: Optional[models.RiskProfile] = None,
        documents: Optional[list] = None,
    ) -> List[Dict[str, Any]]:
        flags = []
        risk_type = (submission.risk_type or "").upper()
        doc_types = [
            d.document_type.upper()
            for d in (documents or [])
            if hasattr(d, "document_type")
        ]

        if "CYBER" in risk_type:
            if not profile or not profile.mfa_enforced:
                flags.append(
                    {
                        "field_or_document_name": "mfa_enforcement",
                        "description": "Multi-Factor Authentication (MFA) enforcement confirmation is missing or unverified.",
                        "severity": "HIGH",
                    }
                )
            if not profile or not profile.security_framework:
                flags.append(
                    {
                        "field_or_document_name": "security_framework",
                        "description": "Cybersecurity compliance framework (e.g. NIST CSF, ISO 27001, SOC 2) not specified.",
                        "severity": "MEDIUM",
                    }
                )
            if not any(
                dt in doc_types
                for dt in ["LOSS_RUNS", "SECURITY_AUDIT", "POLICY_WORDING"]
            ):
                flags.append(
                    {
                        "field_or_document_name": "loss_history_declaration",
                        "description": "Signed 3-year loss history declaration document missing.",
                        "severity": "HIGH",
                    }
                )

        elif "D_AND_O" in risk_type or "D&O" in risk_type or "D_O" in risk_type:
            if not profile or (profile.board_governance_score or 0) <= 0:
                flags.append(
                    {
                        "field_or_document_name": "board_governance",
                        "description": "Board governance evaluation score and oversight details are incomplete.",
                        "severity": "MEDIUM",
                    }
                )
            if not any(
                dt in doc_types
                for dt in ["FINANCIAL_STATEMENTS", "LOSS_RUNS", "POLICY_WORDING"]
            ):
                flags.append(
                    {
                        "field_or_document_name": "financial_statements",
                        "description": "Audited financial statements or D&O loss history documentation missing.",
                        "severity": "HIGH",
                    }
                )

        if submission.attachment_point and submission.primary_policy_limit:
            if submission.attachment_point < (submission.primary_policy_limit * 0.2):
                flags.append(
                    {
                        "field_or_document_name": "attachment_point_depth",
                        "description": "Attachment point is below 20% of primary limit, requiring specialized underwriter review.",
                        "severity": "LOW",
                    }
                )

        return flags

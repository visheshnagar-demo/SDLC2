from typing import List, Dict, Any
from server.schemas import AttachedDocumentCreate, RiskCategory


class MissingInfoValidationEngine:
    MANDATORY_CYBER_DOCS = [
        {
            "field_name": "CYBER_QUESTIONNAIRE",
            "aliases": [
                "CYBER_QUESTIONNAIRE",
                "QUESTIONNAIRE",
                "CYBER_SECURITY_QUESTIONNAIRE",
                "ASSESSMENT",
            ],
            "flag_message": "Missing Information: Cyber Security Assessment Questionnaire Required",
            "is_blocking": True,
        },
        {
            "field_name": "PRIMARY_POLICY_SCHEDULE",
            "aliases": [
                "PRIMARY_POLICY_SCHEDULE",
                "PRIMARY_POLICY",
                "POLICY_SCHEDULE",
                "POLICY_COPY",
            ],
            "flag_message": "Missing Information: Copy of Primary Policy Schedule Required",
            "is_blocking": True,
        },
        {
            "field_name": "INCIDENT_HISTORY",
            "aliases": [
                "INCIDENT_HISTORY",
                "LOSS_RUN",
                "INCIDENT_LOG",
                "CLAIMS_HISTORY",
            ],
            "flag_message": "Missing Information: 3-Year Incident Loss History Required",
            "is_blocking": True,
        },
    ]

    MANDATORY_DO_DOCS = [
        {
            "field_name": "AUDITED_FINANCIALS",
            "aliases": [
                "AUDITED_FINANCIALS",
                "FINANCIALS",
                "AUDITED_FINANCIAL_STATEMENTS",
                "ANNUAL_REPORT",
            ],
            "flag_message": "Missing Information: Latest Audited Financial Statements Required",
            "is_blocking": True,
        },
        {
            "field_name": "BOARD_OWNERSHIP_SUMMARY",
            "aliases": [
                "BOARD_OWNERSHIP_SUMMARY",
                "BOARD_OWNERSHIP",
                "GOVERNANCE_SUMMARY",
                "OWNERSHIP_ROSTER",
            ],
            "flag_message": "Missing Information: Board Ownership and Governance Summary Required",
            "is_blocking": True,
        },
        {
            "field_name": "PRIOR_ACTS_CLAIMS",
            "aliases": [
                "PRIOR_ACTS_CLAIMS",
                "LOSS_RUN",
                "CLAIMS_HISTORY",
                "PRIOR_CLAIMS",
            ],
            "flag_message": "Missing Information: Prior Acts Claims History Required",
            "is_blocking": True,
        },
    ]

    @classmethod
    def evaluate_missing_information(
        cls,
        risk_category: str | RiskCategory,
        attached_documents: List[AttachedDocumentCreate] | List[Any],
    ) -> List[Dict[str, Any]]:
        category_str = (
            risk_category.value
            if isinstance(risk_category, RiskCategory)
            else str(risk_category).upper()
        )
        attached_types = {
            (
                doc.document_type
                if hasattr(doc, "document_type")
                else doc["document_type"]
            )
            .upper()
            .strip()
            for doc in attached_documents
        }

        flags_to_raise: List[Dict[str, Any]] = []
        rules = (
            cls.MANDATORY_CYBER_DOCS
            if category_str == "CYBER"
            else cls.MANDATORY_DO_DOCS
        )

        for rule in rules:
            has_matching_doc = any(
                alias.upper() in attached_types
                or any(alias.upper() in dt for dt in attached_types)
                for alias in rule["aliases"]
            )
            if not has_matching_doc:
                flags_to_raise.append(
                    {
                        "field_name": rule["field_name"],
                        "flag_message": rule["flag_message"],
                        "is_blocking": rule["is_blocking"],
                    }
                )

        return flags_to_raise

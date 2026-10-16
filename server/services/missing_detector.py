from typing import List, Dict, Any


class MissingInformationDetector:
    @staticmethod
    def audit_submission(
        risk_type: str,
        annual_revenue: float,
        sum_insured: float,
        attachment_point: float,
        policy_start_date: Any,
        policy_end_date: Any,
        prior_claims_count: int,
        security_governance_score: float | None,
        attachments: List[Any],
    ) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []
        categories = (
            {att.document_category.upper() for att in attachments}
            if attachments
            else set()
        )

        risk_type_upper = (risk_type or "").upper()

        # 1. Date validation
        if (
            policy_start_date
            and policy_end_date
            and policy_end_date <= policy_start_date
        ):
            flags.append(
                {
                    "flag_code": "EXPIRED_DATE",
                    "field_name": "policy_end_date",
                    "severity": "BLOCKING",
                    "message": "Policy expiration date must be strictly after the inception date.",
                    "is_resolved": False,
                }
            )

        # 2. Financial validity checks
        if sum_insured <= 0:
            flags.append(
                {
                    "flag_code": "MISSING_FIELD",
                    "field_name": "sum_insured",
                    "severity": "BLOCKING",
                    "message": "Sum insured requested must be a positive non-zero value.",
                    "is_resolved": False,
                }
            )

        if annual_revenue <= 0:
            flags.append(
                {
                    "flag_code": "MISSING_FIELD",
                    "field_name": "annual_revenue",
                    "severity": "WARNING",
                    "message": "Annual revenue should be provided for accurate exposure assessment.",
                    "is_resolved": False,
                }
            )

        # 3. Risk-specific requirements
        if risk_type_upper == "CYBER":
            if "CYBER_ASSESSMENT" not in categories:
                flags.append(
                    {
                        "flag_code": "MISSING_ATTACHMENT",
                        "field_name": "CYBER_ASSESSMENT",
                        "severity": "BLOCKING",
                        "message": "Cyber Assessment Questionnaire is required before issuing a formal binding quote.",
                        "is_resolved": False,
                    }
                )

            if prior_claims_count > 0 and "LOSS_RUNS" not in categories:
                flags.append(
                    {
                        "flag_code": "INCOMPLETE_LOSS_RUN",
                        "field_name": "LOSS_RUNS",
                        "severity": "BLOCKING",
                        "message": "Historical loss runs document is mandatory when prior claims are reported.",
                        "is_resolved": False,
                    }
                )

            if security_governance_score is None:
                flags.append(
                    {
                        "flag_code": "MISSING_FIELD",
                        "field_name": "security_governance_score",
                        "severity": "WARNING",
                        "message": "Self-reported security governance score is recommended.",
                        "is_resolved": False,
                    }
                )

        elif risk_type_upper in ["D_AND_O", "D&O"]:
            has_financials = ("AUDITED_FINANCIALS" in categories) or (
                "DIRECTORS_DISCLOSURE" in categories
            )
            if not has_financials:
                flags.append(
                    {
                        "flag_code": "MISSING_ATTACHMENT",
                        "field_name": "AUDITED_FINANCIALS",
                        "severity": "BLOCKING",
                        "message": "Audited Financial Statements or Directors Disclosure document is required for D&O placement.",
                        "is_resolved": False,
                    }
                )

            if prior_claims_count > 0 and "LOSS_RUNS" not in categories:
                flags.append(
                    {
                        "flag_code": "INCOMPLETE_LOSS_RUN",
                        "field_name": "LOSS_RUNS",
                        "severity": "BLOCKING",
                        "message": "Historical loss runs document is mandatory when prior claims or litigation are reported.",
                        "is_resolved": False,
                    }
                )

        return flags

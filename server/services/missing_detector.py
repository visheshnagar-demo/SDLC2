from typing import Dict, Any, List


def detect_missing_information(
    submission_data: Dict[str, Any], attachment_categories: List[str] = None
) -> List[Dict[str, Any]]:
    if attachment_categories is None:
        attachment_categories = []

    flags: List[Dict[str, Any]] = []

    risk_type = (submission_data.get("risk_type") or "CYBER").upper()
    annual_revenue = float(submission_data.get("annual_revenue") or 0.0)
    sum_insured = float(submission_data.get("sum_insured") or 0.0)
    attachment_point = float(submission_data.get("attachment_point") or 0.0)
    policy_start = submission_data.get("policy_start_date")
    policy_end = submission_data.get("policy_end_date")
    prior_claims_count = int(submission_data.get("prior_claims_count") or 0)
    security_score = submission_data.get("security_governance_score")

    # Policy Period
    if not policy_start or not policy_end:
        flags.append(
            {
                "field_name": "policy_period",
                "flag_type": "BLOCKING",
                "message": "Policy inception and expiration dates are mandatory for underwriting evaluation.",
            }
        )

    # Sum Insured
    if sum_insured <= 0:
        flags.append(
            {
                "field_name": "sum_insured",
                "flag_type": "BLOCKING",
                "message": "Valid sum insured / limit requested must be greater than zero.",
            }
        )

    # Attachment Point
    if attachment_point < 0:
        flags.append(
            {
                "field_name": "attachment_point",
                "flag_type": "BLOCKING",
                "message": "Attachment point cannot be negative.",
            }
        )

    # Revenue
    if annual_revenue <= 0:
        flags.append(
            {
                "field_name": "annual_revenue",
                "flag_type": "WARNING",
                "message": "Annual company revenue not provided or zero; financial scale verification needed.",
            }
        )

    # Cyber Security Governance
    if "CYBER" in risk_type and security_score is None:
        flags.append(
            {
                "field_name": "security_governance_score",
                "flag_type": "WARNING",
                "message": "Cyber security posture and governance audit score missing.",
            }
        )

    # Attachments audit
    categories_upper = [c.upper() for c in attachment_categories]
    if prior_claims_count > 0 and "LOSS_RUNS" not in categories_upper:
        flags.append(
            {
                "field_name": "attachments.loss_runs",
                "flag_type": "WARNING",
                "message": f"Historical loss runs schedule required because {prior_claims_count} prior claims were reported.",
            }
        )

    if sum_insured >= 10_000_000 and "FINANCIALS" not in categories_upper:
        flags.append(
            {
                "field_name": "attachments.financials",
                "flag_type": "WARNING",
                "message": "Audited balance sheet / financial statements recommended for capacity requests of $10M+.",
            }
        )

    return flags

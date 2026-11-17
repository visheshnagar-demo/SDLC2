from typing import List, Dict, Any


def detect_missing_information(
    insured_name: str,
    industry_segment: str,
    annual_revenue: float,
    sum_insured: float,
    attachment_point: float,
    policy_start_date: str,
    policy_end_date: str,
    prior_claims_count: int,
    security_governance_score: float,
    attachments: List[Any],
) -> List[Dict[str, Any]]:
    """
    Evaluates submission attributes and attached documentation to generate warning or blocking flags.
    """
    flags: List[Dict[str, Any]] = []

    if not insured_name or not insured_name.strip():
        flags.append(
            {
                "field_name": "insured_name",
                "flag_type": "BLOCKING",
                "message": "Named insured entity is mandatory for facultative underwriting evaluation.",
            }
        )

    if not industry_segment or not industry_segment.strip():
        flags.append(
            {
                "field_name": "industry_segment",
                "flag_type": "WARNING",
                "message": "Industry classification segment is missing.",
            }
        )

    if annual_revenue is None or annual_revenue <= 0:
        flags.append(
            {
                "field_name": "annual_revenue",
                "flag_type": "WARNING",
                "message": "Annual turnover / revenue is unverified or reported as zero.",
            }
        )

    if sum_insured is None or sum_insured <= 0:
        flags.append(
            {
                "field_name": "sum_insured",
                "flag_type": "BLOCKING",
                "message": "Requested sum insured capacity must be greater than zero.",
            }
        )

    if attachment_point is None or attachment_point < 0:
        flags.append(
            {
                "field_name": "attachment_point",
                "flag_type": "BLOCKING",
                "message": "Underlying primary attachment point must be specified.",
            }
        )

    if not policy_start_date or not policy_end_date:
        flags.append(
            {
                "field_name": "policy_period",
                "flag_type": "WARNING",
                "message": "Coverage policy inception and expiration dates are incomplete.",
            }
        )

    if security_governance_score is None or security_governance_score <= 0:
        flags.append(
            {
                "field_name": "security_governance_score",
                "flag_type": "WARNING",
                "message": "Risk security audit and governance score is unpopulated.",
            }
        )

    # Attachment checks
    if not attachments or len(attachments) == 0:
        flags.append(
            {
                "field_name": "attachments",
                "flag_type": "WARNING",
                "message": "No risk assessment documentation or slip schedules attached.",
            }
        )

    # Loss runs required whenever prior claims exist
    if prior_claims_count > 0:
        has_loss_run = any(
            "loss" in getattr(att, "document_category", "").lower()
            or "loss" in getattr(att, "file_name", "").lower()
            or "claim" in getattr(att, "file_name", "").lower()
            for att in (attachments or [])
        )
        if not has_loss_run:
            flags.append(
                {
                    "field_name": "loss_runs",
                    "flag_type": "BLOCKING",
                    "message": "Verified 5-year Loss Run report is required for accounts with prior claims history.",
                }
            )

    return flags

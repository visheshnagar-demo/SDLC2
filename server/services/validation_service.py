from server.models import SubmissionDocument
from server.schemas import CreateSubmissionRequestSchema

ALLOWED_LINES = {"Cyber Risk", "D&O", "E&O", "EPLI", "Medical Professional Liability"}

REQUIRED_DOCS_BY_LINE: dict[str, set[str]] = {
    "Cyber Risk": {"APPLICATION", "LOSS_RUNS"},
    "D&O": {"APPLICATION", "FINANCIAL_STATEMENTS"},
    "E&O": {"APPLICATION", "LOSS_RUNS"},
    "EPLI": {"APPLICATION", "LOSS_RUNS"},
    "Medical Professional Liability": {
        "APPLICATION",
        "LOSS_RUNS",
        "FINANCIAL_STATEMENTS",
    },
}


def validate_submission_payload(req: CreateSubmissionRequestSchema) -> list[str]:
    errors = []
    if req.lineOfBusiness not in ALLOWED_LINES:
        errors.append(
            f"Line of business must be one of: {', '.join(sorted(ALLOWED_LINES))}"
        )

    if req.effectiveDate >= req.expiryDate:
        errors.append("Effective date must be strictly before expiry date")

    if req.policyLimit <= req.attachmentPoint:
        errors.append("Policy limit must be strictly greater than attachment point")

    return errors


def check_document_completeness(
    line_of_business: str, documents: list[SubmissionDocument]
) -> list[str]:
    required = REQUIRED_DOCS_BY_LINE.get(line_of_business, {"APPLICATION"})
    uploaded_types = {doc.document_type for doc in documents}
    missing = [req_doc for req_doc in sorted(required) if req_doc not in uploaded_types]
    return missing

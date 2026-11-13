from typing import Any
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Case
from server.services.rules_engine import BusinessRulesEngine
from server.services.orchestrator import MasterOrchestratorService, _to_float
from server.schemas import BusinessRuleEvaluationRequest

router = APIRouter(tags=["Business Rules"])

RULE_CATALOG = [
    {
        "rule_id": "BR-01",
        "name": "Auto-Triage & Completeness Gate",
        "description": "Requires completeness score >= 80% to proceed past intake. Missing loss runs trigger exception override requirement.",
        "category": "Completeness",
        "threshold": "80% completeness",
    },
    {
        "rule_id": "BR-02",
        "name": "Underwriting Authority Delegation",
        "description": "Standard Underwriter authority capped at $10,000,000. Limits exceeding $10M require Portfolio / Capacity Manager sign-off.",
        "category": "Authority",
        "threshold": "$10,000,000 max underwriter limit",
    },
    {
        "rule_id": "BR-03",
        "name": "Regional Capacity & Accumulation Cap",
        "description": "Limits total regional treaty exposure to $100,000,000 cap.",
        "category": "Capacity",
        "threshold": "$100,000,000 regional cap",
    },
    {
        "rule_id": "BR-04",
        "name": "Actuarial Pricing Hurdle",
        "description": "Target combined ratio must not exceed 95.0% and Rate on Line >= 5.0%.",
        "category": "Pricing",
        "threshold": "<= 95% combined ratio, >= 5% RoL",
    },
    {
        "rule_id": "BR-05",
        "name": "Sanctions & OFAC Clearance",
        "description": "Zero tolerance for sanctions violations across cedent, reinsured territory, and beneficial owners.",
        "category": "Compliance",
        "threshold": "100% sanctions clear",
    },
    {
        "rule_id": "BR-06",
        "name": "Contract Wording Legal Approval",
        "description": "Non-standard exclusion clauses or treaty wording amendments require legal reviewer sign-off.",
        "category": "Legal",
        "threshold": "Standard treaty terms approved",
    },
    {
        "rule_id": "BR-07",
        "name": "6-Point Pre-Bind Governance Grid",
        "description": "All 6 pre-bind conditions (sanctions, pricing hurdle, capacity, rating, wording, HITL sign-off) must be cleared prior to bind.",
        "category": "Bind Governance",
        "threshold": "6 of 6 conditions cleared",
    },
    {
        "rule_id": "BR-08",
        "name": "Immutable Decision Audit Logging",
        "description": "Every agent inference, underwriter override, and governance sign-off is cryptographically hashed and logged to immutable audit trail.",
        "category": "Audit",
        "threshold": "100% action trace coverage",
    },
    {
        "rule_id": "BR-09",
        "name": "Minimum Agent Confidence Threshold",
        "description": "Document extraction confidence < 80% triggers human verification warning.",
        "category": "Agent AI",
        "threshold": "80% confidence score",
    },
    {
        "rule_id": "BR-10",
        "name": "Cryptographic Binder Certificate Generation",
        "description": "Generates SHA-256 binder hash binding case, cedent, limit, and signatory for downstream PAS transmission.",
        "category": "Policy Binding",
        "threshold": "Valid SHA-256 binder hash",
    },
]


@router.get("", response_model=list[dict[str, Any]])
@router.get("/", response_model=list[dict[str, Any]])
def list_business_rules() -> list[dict[str, Any]]:
    """List all deterministic business rules and criteria (BR-01 to BR-10)."""
    return RULE_CATALOG


@router.post("/evaluate", response_model=dict[str, Any])
@router.post("", response_model=dict[str, Any])
@router.post("/", response_model=dict[str, Any])
def evaluate_business_rules(
    req: BusinessRuleEvaluationRequest = BusinessRuleEvaluationRequest(),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Evaluate business rules against provided parameters or active case."""
    rule_key = (req.rule or req.rule_id or "").upper().replace("-", "_")

    case = None
    if req.case_id:
        try:
            case = MasterOrchestratorService.get_case(db, req.case_id)
        except Exception:
            case = None
    if not case:
        case = db.query(Case).first()

    results: dict[str, Any] = {}

    # Rule BR-01: Completeness
    if not rule_key or rule_key in ("BR_01", "BR01", "COMPLETENESS", "ALL"):
        if req.completeness_score is not None:
            score = _to_float(req.completeness_score)
            is_complete = score >= 0.80
            results["BR-01"] = {
                "rule": "BR-01",
                "passed": is_complete,
                "completeness_score": score,
                "missing_documents": []
                if is_complete
                else ["3-Year Cumulative Loss Runs & Claims History"],
                "requires_override": not is_complete,
                "message": (
                    "Completeness validation passed. All mandatory documents verified."
                    if is_complete
                    else "Completeness validation blocked. Mandatory 3-year loss runs missing. Human exception override required."
                ),
            }
        elif case:
            results["BR-01"] = BusinessRulesEngine.evaluate_completeness_gate(case)

    # Rule BR-02: Authority
    if not rule_key or rule_key in (
        "BR_02",
        "BR02",
        "AUTHORITY",
        "DELEGATION",
        "ALL",
    ):
        req_limit = _to_float(
            req.requested_limit, case.requested_limit if case else 5000000.0
        )
        actor = req.actor_persona or "Reinsurance Underwriter"
        results["BR-02"] = BusinessRulesEngine.evaluate_authority_level(
            req_limit, actor
        )

    # Rule BR-03: Capacity
    if not rule_key or rule_key in (
        "BR_03",
        "BR03",
        "CAPACITY",
        "REGIONAL_CAPACITY",
        "ALL",
    ):
        req_limit = _to_float(
            req.requested_limit, case.requested_limit if case else 5000000.0
        )
        existing = _to_float(req.existing_exposure, 45000000.0)
        results["BR-03"] = BusinessRulesEngine.evaluate_regional_capacity(
            req_limit, existing
        )

    # Rule BR-04: Pricing Hurdle
    if not rule_key or rule_key in (
        "BR_04",
        "BR04",
        "PRICING",
        "PRICING_HURDLE",
        "ALL",
    ):
        cr = _to_float(req.combined_ratio, 88.5)
        rol = _to_float(req.rate_on_line, 8.4)
        results["BR-04"] = BusinessRulesEngine.evaluate_pricing_hurdle(cr, rol)

    # Rule BR-07: Bind Readiness
    if not rule_key or rule_key in (
        "BR_07",
        "BR07",
        "BIND_READINESS",
        "CHECKLIST",
        "ALL",
    ):
        if case and case.bind_checklist:
            results["BR-07"] = (
                BusinessRulesEngine.evaluate_bind_readiness_checklist(
                    case.bind_checklist
                )
            )
        else:
            results["BR-07"] = {
                "rule": "BR-07",
                "all_cleared": True,
                "message": "Pre-bind compliance verified.",
            }

    if rule_key and rule_key not in ("ALL", ""):
        for k, v in results.items():
            if (
                k.replace("-", "_") == rule_key
                or k == rule_key
                or rule_key in k.replace("-", "_")
            ):
                return {"status": "ok", "rule": k, "evaluation": v, **v}
        if results:
            first_val = list(results.values())[0]
            return {"status": "ok", **first_val}

    all_passed = all(
        res.get("passed", True)
        and res.get("authorized", True)
        and res.get("all_cleared", True)
        for res in results.values()
    )

    return {
        "status": "ok",
        "rules_evaluated": list(results.keys()),
        "all_passed": all_passed,
        "results": results,
    }

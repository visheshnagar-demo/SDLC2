import hashlib
from typing import Any
from server.models import Case, BindChecklist


class BusinessRulesEngine:
    """Evaluates deterministic reinsurance business rules (BR-01 to BR-10)."""

    UNDERWRITER_AUTHORITY_LIMIT = 10000000.0  # $10M max standard authority (BR-02)
    REGIONAL_ACCUMULATION_CAP = 100000000.0  # $100M regional capacity cap (BR-03)
    TARGET_COMBINED_RATIO_MAX = 95.0  # Max target combined ratio % (BR-04)
    MIN_CONFIDENCE_THRESHOLD = 0.80  # AI confidence threshold (BR-09)

    @classmethod
    def evaluate_completeness_gate(cls, case: Case) -> dict[str, Any]:
        """BR-01: Auto-triage and completeness verification."""
        is_complete = case.completeness_score >= 0.80
        missing_docs = []
        if case.completeness_score < 0.80:
            missing_docs.append("3-Year Cumulative Loss Runs & Claims History")

        return {
            "rule": "BR-01",
            "passed": is_complete,
            "completeness_score": case.completeness_score,
            "missing_documents": missing_docs,
            "requires_override": not is_complete,
            "message": (
                "Completeness validation passed. All mandatory documents verified."
                if is_complete
                else "Completeness validation blocked. Mandatory 3-year loss runs missing. Human exception override required."
            ),
        }

    @classmethod
    def evaluate_authority_level(
        cls, requested_limit: float, actor_persona: str
    ) -> dict[str, Any]:
        """BR-02: Underwriting authority delegation."""
        exceeds_standard = requested_limit > cls.UNDERWRITER_AUTHORITY_LIMIT
        persona_normalized = actor_persona.upper().replace(" ", "_")

        has_authority = True
        if exceeds_standard:
            # Requires Manager or Executive persona
            has_authority = any(
                p in persona_normalized
                for p in ["PORTFOLIO", "MANAGER", "EXECUTIVE", "ADMIN"]
            )

        return {
            "rule": "BR-02",
            "requested_limit": requested_limit,
            "authority_limit": cls.UNDERWRITER_AUTHORITY_LIMIT,
            "exceeds_authority": exceeds_standard,
            "authorized": has_authority,
            "required_persona": "Portfolio / Capacity Manager"
            if exceeds_standard
            else "Reinsurance Underwriter",
            "message": (
                f"Limit of ${requested_limit:,.2f} exceeds standard Underwriter authority (${cls.UNDERWRITER_AUTHORITY_LIMIT:,.2f}). Manager sign-off required."
                if exceeds_standard
                else f"Limit of ${requested_limit:,.2f} is within standard Underwriter authority."
            ),
        }

    @classmethod
    def evaluate_regional_capacity(
        cls, requested_limit: float, existing_exposure: float = 45000000.0
    ) -> dict[str, Any]:
        """BR-03: Regional and treaty capacity accumulation check."""
        total_projected = existing_exposure + requested_limit
        passed = total_projected <= cls.REGIONAL_ACCUMULATION_CAP
        headroom = cls.REGIONAL_ACCUMULATION_CAP - total_projected

        return {
            "rule": "BR-03",
            "existing_exposure": existing_exposure,
            "requested_limit": requested_limit,
            "total_projected_exposure": total_projected,
            "regional_cap": cls.REGIONAL_ACCUMULATION_CAP,
            "headroom_remaining": headroom,
            "passed": passed,
            "message": (
                f"Sufficient regional capacity headroom (${headroom:,.2f} remaining of ${cls.REGIONAL_ACCUMULATION_CAP:,.2f} cap)."
                if passed
                else f"Capacity exceeded by ${abs(headroom):,.2f}."
            ),
        }

    @classmethod
    def evaluate_pricing_hurdle(
        cls, combined_ratio: float, rate_on_line: float
    ) -> dict[str, Any]:
        """BR-04: Actuarial pricing hurdle evaluation."""
        ratio_passed = combined_ratio <= cls.TARGET_COMBINED_RATIO_MAX
        rol_passed = rate_on_line >= 5.0
        passed = ratio_passed and rol_passed

        return {
            "rule": "BR-04",
            "combined_ratio": combined_ratio,
            "target_max_ratio": cls.TARGET_COMBINED_RATIO_MAX,
            "rate_on_line": rate_on_line,
            "passed": passed,
            "message": (
                f"Pricing hurdle achieved: Combined ratio {combined_ratio:.1f}% <= {cls.TARGET_COMBINED_RATIO_MAX:.1f}% target."
                if passed
                else f"Pricing hurdle warning: Combined ratio {combined_ratio:.1f}% exceeds target."
            ),
        }

    @classmethod
    def evaluate_bind_readiness_checklist(
        cls, checklist: BindChecklist
    ) -> dict[str, Any]:
        """BR-07: 6-point pre-bind governance verification grid."""
        items = {
            "Sanctions & OFAC Screening": checklist.sanctions_cleared,
            "Actuarial Pricing Hurdle Cleared": checklist.pricing_hurdle_cleared,
            "Treaty & Regional Capacity Approved": checklist.capacity_approved,
            "Cedent Financial Rating Confirmed": checklist.financial_rating_confirmed,
            "Treaty Contract Wording Approved": checklist.wording_approved,
            "HITL Underwriting Sign-Off": checklist.hitl_signed_off,
        }
        all_passed = all(items.values())
        failed_items = [name for name, val in items.items() if not val]

        return {
            "rule": "BR-07",
            "all_cleared": all_passed,
            "items": items,
            "failed_items": failed_items,
            "message": (
                "All 6 pre-bind compliance gates passed. Case is ready to bind."
                if all_passed
                else f"Pre-bind checklist incomplete. Pending items: {', '.join(failed_items)}."
            ),
        }

    @classmethod
    def generate_binder_hash(
        cls, case_number: str, cedent: str, limit: float, bound_by: str
    ) -> str:
        """BR-10: Cryptographic binder hash generation."""
        raw = f"{case_number}:{cedent}:{limit}:{bound_by}:GENRE-QTB-BINDER-2026"
        return "SHA256:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()

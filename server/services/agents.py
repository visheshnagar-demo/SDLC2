from typing import Any
from server.models import Case
from server.services.rules_engine import BusinessRulesEngine


class AgentSimulationService:
    """Provides simulated reasoning, confidence scores, citations, and outputs for 12 QTB agents."""

    @classmethod
    def execute_agent_for_stage(
        cls, stage_key: str, case: Case, actor_persona: str, parameters: dict[str, Any]
    ) -> dict[str, Any]:
        handler_map = {
            "SUBMISSION_INTAKE": cls._handle_intake_agent,
            "DOCUMENT_EXTRACTION": cls._handle_doc_intelligence_agent,
            "COMPLETENESS_VALIDATION": cls._handle_validation_agent,
            "RISK_ASSESSMENT": cls._handle_risk_assessment_agent,
            "PORTFOLIO_EVALUATION": cls._handle_portfolio_agent,
            "ACTUARIAL_PRICING": cls._handle_pricing_agent,
            "QUOTE_STRUCTURING": cls._handle_quote_agent,
            "REVIEW_APPROVAL": cls._handle_legal_compliance_agent,
            "NEGOTIATION": cls._handle_negotiation_agent,
            "BIND_READINESS": cls._handle_bind_readiness_agent,
            "BIND_DECISION": cls._handle_bind_decision_agent,
            "CONTRACT_HANDOFF": cls._handle_contract_handoff_agent,
        }

        handler = handler_map.get(stage_key)
        if not handler:
            return {
                "status": "COMPLETED",
                "agent_name": "MasterOrchestrator",
                "reasoning": f"Simulated execution for stage {stage_key}.",
                "confidence_score": 0.95,
            }

        return handler(case, actor_persona, parameters)

    @classmethod
    def _handle_intake_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        return {
            "status": "COMPLETED",
            "agent_name": "IntakeAgent",
            "reasoning": (
                f"Classified submission documents for {case.cedent_name}. "
                f"Identified Line of Business: {case.line_of_business}, Treaty Structure: {case.treaty_type}. "
                "Document format validated and indexed for OCR clause extraction."
            ),
            "confidence_score": 0.98 if case.scenario_id != "SCENARIO_B" else 0.88,
        }

    @classmethod
    def _handle_doc_intelligence_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        conf = 0.96 if case.scenario_id != "SCENARIO_B" else 0.64
        return {
            "status": "COMPLETED",
            "agent_name": "DocumentIntelligenceAgent",
            "reasoning": (
                f"Extracted {len(case.extracted_fields)} key treaty fields from submission slip and wording artifacts. "
                f"Requested limit: ${case.requested_limit:,.2f}, Retention: ${case.retention_amount:,.2f}. "
                f"Citations mapped to source PDF coordinates with overall extraction confidence {conf * 100:.1f}%."
            ),
            "confidence_score": conf,
        }

    @classmethod
    def _handle_validation_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        res = BusinessRulesEngine.evaluate_completeness_gate(case)
        if not res["passed"]:
            return {
                "status": "EXCEPTION",
                "agent_name": "ValidationAgent",
                "reasoning": (
                    "BR-01 Validation Gate Warning: Submission completeness is below threshold (65%). "
                    "Mandatory 3-year loss runs are missing. Automated progression halted. "
                    "Underwriter exception override or broker follow-up required."
                ),
                "confidence_score": 0.64,
            }

        return {
            "status": "COMPLETED",
            "agent_name": "ValidationAgent",
            "reasoning": (
                "BR-01 Verification Passed: All mandatory treaty documentation, loss history, and schedule of exposures are 100% complete and cross-reconciled."
            ),
            "confidence_score": 0.99,
        }

    @classmethod
    def _handle_risk_assessment_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        loss_ratio = case.historical_loss_ratio or 60.0
        risk_tier = (
            "Low"
            if loss_ratio < 60
            else ("Moderate" if loss_ratio < 70 else "Elevated")
        )
        return {
            "status": "COMPLETED",
            "agent_name": "RiskAssessmentAgent",
            "reasoning": (
                f"Composite risk score evaluated at 84/100 ({risk_tier} Risk Tier). "
                f"5-Year Historical Loss Ratio: {loss_ratio:.1f}%. Cedent underwriting discipline is strong, "
                "with non-overlapping catastrophe clash exposure in target operating territories."
            ),
            "confidence_score": 0.94,
        }

    @classmethod
    def _handle_portfolio_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        cap_eval = BusinessRulesEngine.evaluate_regional_capacity(case.requested_limit)
        return {
            "status": "COMPLETED",
            "agent_name": "PortfolioAgent",
            "reasoning": (
                f"BR-03 Portfolio Check: Evaluated regional retrocession and clash thresholds. "
                f"{cap_eval['message']} Projected regional line utilization: "
                f"{(cap_eval['total_projected_exposure'] / cap_eval['regional_cap']) * 100:.1f}%."
            ),
            "confidence_score": 0.97,
        }

    @classmethod
    def _handle_pricing_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        return {
            "status": "COMPLETED",
            "agent_name": "PricingAgent",
            "reasoning": (
                "Actuarial loss distribution simulation completed using AIR Touchstone / RMS RiskLink models. "
                "Technical rate calculated with combined ratio well within target hurdle (< 95%). "
                "Recommended pricing layers generated across Quota Share and Excess of Loss options."
            ),
            "confidence_score": 0.95,
        }

    @classmethod
    def _handle_quote_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        return {
            "status": "COMPLETED",
            "agent_name": "QuoteAgent",
            "reasoning": (
                f"Structured {len(case.quotes)} multi-option quote packages. Configured treaty terms, ceding commissions, "
                "reinstatement provisions, and standard Gen Re exclusionary wordings. Ready for underwriter and governance sign-off."
            ),
            "confidence_score": 0.98,
        }

    @classmethod
    def _handle_legal_compliance_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        auth_eval = BusinessRulesEngine.evaluate_authority_level(
            case.requested_limit, persona
        )
        if auth_eval["exceeds_authority"] and not auth_eval["authorized"]:
            return {
                "status": "BLOCKED",
                "agent_name": "LegalComplianceAgent",
                "reasoning": (
                    f"BR-02 Authority Gate: Requested limit of ${case.requested_limit:,.2f} exceeds standard Underwriter threshold ($10M). "
                    f"Referred to {auth_eval['required_persona']}. Signoff pending."
                ),
                "confidence_score": 0.92,
            }

        return {
            "status": "COMPLETED",
            "agent_name": "LegalComplianceAgent",
            "reasoning": (
                "BR-05 Compliance Review Passed: Sanctions screening cleared (OFAC / EU / UK HM Treasury 0 hits). "
                "Treaty wording adheres to Gen Re standard clauses with governing law confirmed."
            ),
            "confidence_score": 0.99,
        }

    @classmethod
    def _handle_negotiation_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        return {
            "status": "COMPLETED",
            "agent_name": "NegotiationAgent",
            "reasoning": (
                "Analyzed broker counter-proposal. Evaluated concession boundaries: recommended holding ceding commission at 22.5% "
                "while offering a 0.25% credit on rate on line for a 2-year treaty commitment."
            ),
            "confidence_score": 0.93,
        }

    @classmethod
    def _handle_bind_readiness_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        if case.bind_checklist:
            chk_eval = BusinessRulesEngine.evaluate_bind_readiness_checklist(
                case.bind_checklist
            )
            if not chk_eval["all_cleared"]:
                return {
                    "status": "BLOCKED",
                    "agent_name": "BindReadinessAgent",
                    "reasoning": f"BR-07 Pre-Bind Verification: {chk_eval['message']}",
                    "confidence_score": 0.85,
                }

        return {
            "status": "COMPLETED",
            "agent_name": "BindReadinessAgent",
            "reasoning": (
                "BR-07 Verification Passed: 6-point pre-bind governance checklist 100% verified. "
                "Sanctions, pricing hurdles, capacity limits, and signed terms fully cleared for policy execution."
            ),
            "confidence_score": 1.0,
        }

    @classmethod
    def _handle_bind_decision_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        return {
            "status": "COMPLETED",
            "agent_name": "HumanUnderwriter",
            "reasoning": (
                f"Authorized policy binding under Underwriter Persona ({persona}). "
                "Cryptographic binder certificate generated and committed to audit ledger."
            ),
            "confidence_score": 1.0,
        }

    @classmethod
    def _handle_contract_handoff_agent(
        cls, case: Case, persona: str, params: dict
    ) -> dict[str, Any]:
        return {
            "status": "COMPLETED",
            "agent_name": "ContractHandoffAgent",
            "reasoning": (
                f"Generated formal Reinsurance Binder Certificate for {case.cedent_name}. "
                "Downstream Policy Administration System (PAS) payload dispatched via secure API bus."
            ),
            "confidence_score": 1.0,
        }

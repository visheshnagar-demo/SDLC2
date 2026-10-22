from datetime import datetime, timezone
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException
from server.models import (
    Case,
    ExtractedField,
    Quote,
    StageStatus,
    AuditLog,
    PricingScenario,
)
from server.services.agents import AgentSimulationService
from server.services.rules_engine import BusinessRulesEngine
from server.schemas import (
    PricingInputDTO,
    PricingResultDTO,
    QuoteCreateDTO,
    BindConfirmationDTO,
)


class MasterOrchestratorService:
    """Coordinates lifecycle state transitions, agent execution, and human-in-the-loop decisions."""

    @classmethod
    def get_case(cls, db: Session, case_id: str) -> Case:
        case = (
            db.query(Case)
            .filter(
                (Case.id == case_id)
                | (Case.case_number == case_id)
                | (Case.scenario_id == case_id)
            )
            .first()
        )
        if not case:
            raise HTTPException(status_code=404, detail=f"Case not found: {case_id}")
        return case

    @classmethod
    def execute_stage(
        cls,
        db: Session,
        case_id: str,
        stage_key: str,
        actor_persona: str = "Reinsurance Underwriter",
        parameters: dict | None = None,
    ) -> dict:
        case = cls.get_case(db, case_id)
        params = parameters or {}

        # Find stage status record
        stage_status = (
            db.query(StageStatus)
            .filter(StageStatus.case_id == case.id, StageStatus.stage_key == stage_key)
            .first()
        )
        if not stage_status:
            raise HTTPException(
                status_code=404,
                detail=f"Stage {stage_key} not found for case {case_id}",
            )

        # Simulate agent execution for this stage
        result = AgentSimulationService.execute_agent_for_stage(
            stage_key=stage_key,
            case=case,
            actor_persona=actor_persona,
            parameters=params,
        )

        stage_status.status = result["status"]
        stage_status.agent_name = result["agent_name"]
        stage_status.agent_reasoning = result["reasoning"]
        stage_status.confidence_score = result["confidence_score"]
        stage_status.updated_at = datetime.now(timezone.utc)

        # Update case current stage if completed
        if result["status"] == "COMPLETED":
            case.current_stage = stage_key
            if stage_key == "BIND_DECISION" or stage_key == "CONTRACT_HANDOFF":
                case.status = "BOUND"
            elif case.status != "BOUND":
                case.status = "IN_PROGRESS"
        elif result["status"] == "EXCEPTION":
            case.status = "IN_PROGRESS"
        elif result["status"] == "BLOCKED":
            case.status = "PENDING_APPROVAL"

        case.updated_at = datetime.now(timezone.utc)

        # Create audit log entry (BR-08)
        audit = AuditLog(
            case_id=case.id,
            stage_key=stage_key,
            agent_name=result["agent_name"],
            action_type="STAGE_EXECUTED",
            confidence_score=result["confidence_score"],
            rationale=result["reasoning"],
            actor_persona=actor_persona,
            timestamp=datetime.now(timezone.utc),
        )
        db.add(audit)

        db.commit()
        db.refresh(case)

        return {
            "stage_key": stage_key,
            "status": stage_status.status,
            "agent_reasoning": stage_status.agent_reasoning,
            "confidence_score": stage_status.confidence_score,
            "updated_case": case,
        }

    @classmethod
    def record_override(
        cls,
        db: Session,
        case_id: str,
        stage_key: str,
        field_name: str | None,
        override_value: str,
        rationale: str,
        actor_persona: str,
    ) -> AuditLog:
        case = cls.get_case(db, case_id)

        # If field name provided, update extracted field
        if field_name:
            field = (
                db.query(ExtractedField)
                .filter(
                    ExtractedField.case_id == case.id,
                    ExtractedField.field_name == field_name,
                )
                .first()
            )
            if field:
                field.is_overridden = True
                field.overridden_value = override_value

        # Unblock stage if was in EXCEPTION / BLOCKED
        stage_status = (
            db.query(StageStatus)
            .filter(StageStatus.case_id == case.id, StageStatus.stage_key == stage_key)
            .first()
        )
        if stage_status:
            stage_status.status = "COMPLETED"
            stage_status.agent_reasoning += (
                f" [Human Override by {actor_persona}: {rationale}]"
            )
            case.completeness_score = 1.0

        audit = AuditLog(
            case_id=case.id,
            stage_key=stage_key,
            agent_name="HumanUnderwriter",
            action_type="EXCEPTION_OVERRIDE",
            confidence_score=1.0,
            rationale=f"Override applied ({override_value}): {rationale}",
            actor_persona=actor_persona,
            timestamp=datetime.now(timezone.utc),
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    @classmethod
    def calculate_pricing(
        cls, db: Session, case_id: str, pricing_input: PricingInputDTO
    ) -> PricingResultDTO:
        case = cls.get_case(db, case_id)

        # Technical pricing model
        expected_loss = pricing_input.expected_loss
        technical_premium = (
            expected_loss + pricing_input.risk_load + pricing_input.expense_load
        )
        recommended_rate = (
            technical_premium / max(case.requested_limit, 100000.0)
        ) * 100
        combined_ratio = pricing_input.target_combined_ratio

        loss_dist = [
            {
                "return_period": "10-Year",
                "loss_estimate": expected_loss * 0.4,
                "probability": 0.10,
            },
            {
                "return_period": "25-Year",
                "loss_estimate": expected_loss * 0.9,
                "probability": 0.04,
            },
            {
                "return_period": "50-Year",
                "loss_estimate": expected_loss * 1.8,
                "probability": 0.02,
            },
            {
                "return_period": "100-Year",
                "loss_estimate": expected_loss * 3.5,
                "probability": 0.01,
            },
        ]

        # Update or create pricing scenario
        ps = (
            db.query(PricingScenario).filter(PricingScenario.case_id == case.id).first()
        )
        if ps:
            ps.model_name = pricing_input.model_name
            ps.technical_premium = technical_premium
            ps.recommended_rate = recommended_rate
            ps.expected_loss = expected_loss
            ps.combined_ratio = combined_ratio
            ps.loss_distribution_json = json.dumps(loss_dist)
        else:
            ps = PricingScenario(
                case_id=case.id,
                model_name=pricing_input.model_name,
                technical_premium=technical_premium,
                recommended_rate=recommended_rate,
                expected_loss=expected_loss,
                combined_ratio=combined_ratio,
                loss_distribution_json=json.dumps(loss_dist),
            )
            db.add(ps)

        # Audit pricing action
        audit = AuditLog(
            case_id=case.id,
            stage_key="ACTUARIAL_PRICING",
            agent_name="PricingAgent",
            action_type="PRICING_CALCULATED",
            confidence_score=0.96,
            rationale=f"Actuarial pricing calculated for {pricing_input.model_name}: Tech Premium ${technical_premium:,.2f}, Combined Ratio {combined_ratio:.1f}%.",
            actor_persona="Actuary / Pricing Specialist",
            timestamp=datetime.now(timezone.utc),
        )
        db.add(audit)

        db.commit()

        return PricingResultDTO(
            technical_premium=technical_premium,
            recommended_rate=recommended_rate,
            expected_loss=expected_loss,
            combined_ratio=combined_ratio,
            loss_distribution=loss_dist,
        )

    @classmethod
    def create_quote(
        cls, db: Session, case_id: str, quote_data: QuoteCreateDTO
    ) -> Quote:
        case = cls.get_case(db, case_id)

        rol = (quote_data.ceded_premium / max(quote_data.limit_amount, 1.0)) * 100

        quote = Quote(
            case_id=case.id,
            option_name=quote_data.option_name,
            structure_type=quote_data.structure_type,
            limit_amount=quote_data.limit_amount,
            retention_amount=quote_data.retention_amount,
            ceded_premium=quote_data.ceded_premium,
            rate_on_line=rol,
            commission_rate=quote_data.commission_rate,
            expected_loss_ratio=quote_data.expected_loss_ratio,
            combined_ratio=quote_data.combined_ratio,
            status="APPROVED",
            is_selected=False,
        )
        db.add(quote)

        audit = AuditLog(
            case_id=case.id,
            stage_key="QUOTE_STRUCTURING",
            agent_name="QuoteAgent",
            action_type="QUOTE_CREATED",
            confidence_score=0.98,
            rationale=f"New quote option '{quote_data.option_name}' structured with limit ${quote_data.limit_amount:,.2f}.",
            actor_persona="Reinsurance Underwriter",
            timestamp=datetime.now(timezone.utc),
        )
        db.add(audit)

        db.commit()
        db.refresh(quote)
        return quote

    @classmethod
    def submit_approval(
        cls,
        db: Session,
        case_id: str,
        approval_id: str,
        decision: str,
        actor_persona: str,
        rationale: str,
    ) -> dict:
        case = cls.get_case(db, case_id)

        # Check authority rule BR-02
        auth_eval = BusinessRulesEngine.evaluate_authority_level(
            case.requested_limit, actor_persona
        )
        if (
            decision == "APPROVED"
            and auth_eval["exceeds_authority"]
            and not auth_eval["authorized"]
        ):
            raise HTTPException(
                status_code=403,
                detail=f"Persona '{actor_persona}' lacks authority to approve deals exceeding ${auth_eval['authority_limit']:,.2f}. Required: Portfolio / Capacity Manager.",
            )

        # Mark approval stage completed
        stage_status = (
            db.query(StageStatus)
            .filter(
                StageStatus.case_id == case.id,
                StageStatus.stage_key == "REVIEW_APPROVAL",
            )
            .first()
        )
        if stage_status:
            stage_status.status = "COMPLETED" if decision == "APPROVED" else "BLOCKED"
            stage_status.agent_reasoning = f"{decision} by {actor_persona}: {rationale}"

        # Update checklist
        if case.bind_checklist:
            if decision == "APPROVED":
                case.bind_checklist.capacity_approved = True
                case.bind_checklist.wording_approved = True
                case.bind_checklist.hitl_signed_off = True

        audit = AuditLog(
            case_id=case.id,
            stage_key="REVIEW_APPROVAL",
            agent_name="HumanUnderwriter",
            action_type=f"APPROVAL_{decision}",
            confidence_score=1.0,
            rationale=f"Governance decision '{decision}' submitted by {actor_persona}. {rationale}",
            actor_persona=actor_persona,
            timestamp=datetime.now(timezone.utc),
        )
        db.add(audit)

        db.commit()
        return {
            "case_id": case.id,
            "decision": decision,
            "actor_persona": actor_persona,
            "status": "COMPLETED" if decision == "APPROVED" else "REJECTED",
        }

    @classmethod
    def execute_bind(
        cls, db: Session, case_id: str, actor_persona: str, signoff_notes: str
    ) -> BindConfirmationDTO:
        case = cls.get_case(db, case_id)

        if not case.bind_checklist:
            raise HTTPException(
                status_code=400, detail="Bind checklist not initialized for case."
            )

        # Ensure all checklist items are checked for bind
        case.bind_checklist.sanctions_cleared = True
        case.bind_checklist.pricing_hurdle_cleared = True
        case.bind_checklist.capacity_approved = True
        case.bind_checklist.financial_rating_confirmed = True
        case.bind_checklist.wording_approved = True
        case.bind_checklist.hitl_signed_off = True

        cert_hash = BusinessRulesEngine.generate_binder_hash(
            case_number=case.case_number,
            cedent=case.cedent_name,
            limit=case.requested_limit,
            bound_by=actor_persona,
        )

        now = datetime.now(timezone.utc)
        case.bind_checklist.binder_certificate_hash = cert_hash
        case.bind_checklist.bound_at = now
        case.bind_checklist.bound_by = actor_persona

        case.current_stage = "BIND_DECISION"
        case.status = "BOUND"

        # Update stages
        for s in case.stages:
            if s.stage_order <= 11:
                s.status = "COMPLETED"

        # Mark handoff stage completed
        handoff_stage = (
            db.query(StageStatus)
            .filter(
                StageStatus.case_id == case.id,
                StageStatus.stage_key == "CONTRACT_HANDOFF",
            )
            .first()
        )
        if handoff_stage:
            handoff_stage.status = "COMPLETED"
            handoff_stage.agent_reasoning = f"Binder certificate {cert_hash[:16]} generated and transmitted to Downstream PAS."

        pas_payload = {
            "policy_number": case.case_number,
            "cedent": case.cedent_name,
            "line_of_business": case.line_of_business,
            "treaty_type": case.treaty_type,
            "limit": case.requested_limit,
            "retention": case.retention_amount,
            "binder_hash": cert_hash,
            "effective_date": now.strftime("%Y-%m-%d"),
            "bound_by": actor_persona,
            "signoff_notes": signoff_notes,
            "status": "BOUND",
        }

        audit = AuditLog(
            case_id=case.id,
            stage_key="BIND_DECISION",
            agent_name="HumanUnderwriter",
            action_type="POLICY_BOUND",
            confidence_score=1.0,
            rationale=f"Policy successfully bound with hash {cert_hash}. {signoff_notes}",
            actor_persona=actor_persona,
            timestamp=now,
        )
        db.add(audit)

        db.commit()
        db.refresh(case)

        return BindConfirmationDTO(
            case_id=case.id,
            case_number=case.case_number,
            status="BOUND",
            binder_certificate_hash=cert_hash,
            bound_at=now,
            bound_by=actor_persona,
            pas_payload=pas_payload,
        )

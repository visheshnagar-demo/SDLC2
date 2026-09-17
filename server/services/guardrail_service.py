from typing import List, Dict
from sqlalchemy.orm import Session
from server.models.guardrail import GuardrailPolicyModel
from server.schemas.guardrail import GuardrailCheckResult


class GuardrailService:
    @staticmethod
    def get_guardrails(db: Session) -> List[GuardrailPolicyModel]:
        return db.query(GuardrailPolicyModel).filter_by(status="ACTIVE").all()

    @staticmethod
    def evaluate_guardrails(
        db: Session, metrics: Dict[str, float]
    ) -> List[GuardrailCheckResult]:
        policies = GuardrailService.get_guardrails(db)
        results = []

        for p in policies:
            actual = 0.0
            if p.rule_key == "min_margin":
                actual = metrics.get("margin_pct", 32.0)
            elif p.rule_key == "min_pb_share":
                actual = metrics.get("pb_share_pct", 33.0)
            elif p.rule_key == "max_shelf_capacity":
                actual = metrics.get("capacity_pct", 90.0)
            elif p.rule_key == "min_in_stock":
                actual = metrics.get("in_stock_pct", 96.0)
            else:
                actual = metrics.get(p.rule_key, p.threshold_value)

            status = "PASSED"
            if p.comparison_operator == ">=":
                if actual < p.threshold_value:
                    status = "FAILED"
            elif p.comparison_operator == "<=":
                if actual > p.threshold_value:
                    status = "FAILED"
            elif p.comparison_operator == ">":
                if actual <= p.threshold_value:
                    status = "FAILED"
            elif p.comparison_operator == "<":
                if actual >= p.threshold_value:
                    status = "FAILED"

            results.append(
                GuardrailCheckResult(
                    rule_key=p.rule_key,
                    rule_name=p.rule_name,
                    threshold_value=p.threshold_value,
                    comparison_operator=p.comparison_operator,
                    actual_value=round(actual, 1),
                    status=status,
                )
            )

        return results

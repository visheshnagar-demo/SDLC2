from typing import List, Tuple
from app.schemas.scenario import GuardrailItem


def evaluate_guardrails(
    projected_pb_share_pct: float,
    projected_shelf_capacity_pct: float,
    projected_instock_rate_pct: float,
) -> Tuple[List[GuardrailItem], bool]:
    pb_pass = projected_pb_share_pct >= 25.0
    capacity_pass = projected_shelf_capacity_pct <= 100.0
    instock_pass = projected_instock_rate_pct >= 95.0

    guardrails = [
        GuardrailItem(
            rule_id="pb_share_target",
            name="Minimum Private Brand %",
            target_value=">= 25.0%",
            projected_value=f"{projected_pb_share_pct:.1f}%",
            status="PASS" if pb_pass else "FAIL",
            is_critical=True,
        ),
        GuardrailItem(
            rule_id="shelf_capacity_ceiling",
            name="Shelf Capacity Ceiling",
            target_value="<= 100.0%",
            projected_value=f"{projected_shelf_capacity_pct:.1f}%",
            status="PASS" if capacity_pass else "FAIL",
            is_critical=True,
        ),
        GuardrailItem(
            rule_id="instock_threshold",
            name="Minimum In-Stock Threshold",
            target_value=">= 95.0%",
            projected_value=f"{projected_instock_rate_pct:.1f}%",
            status="PASS" if instock_pass else "FAIL",
            is_critical=True,
        ),
    ]

    can_submit = all(g.status == "PASS" for g in guardrails)
    return guardrails, can_submit

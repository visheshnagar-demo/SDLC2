from typing import List, Dict, Any, Tuple


class GuardrailService:
    @staticmethod
    def evaluate_guardrails(
        baseline_pb_pct: float,
        baseline_utilization_pct: float,
        baseline_in_stock_rate: float,
        scenario_pb_change_pct: float = 0.0,
        scenario_utilization_pct: float = None,
    ) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Evaluate core guardrails:
        1. Private Brand Share >= 25.0%
        2. Shelf Capacity Utilization <= 100.0%
        3. In-Stock SLA >= 95.0%
        """
        # Calculate actual/projected PB%
        projected_pb = baseline_pb_pct + scenario_pb_change_pct
        pb_passed = projected_pb >= 25.0

        # Calculate shelf utilization
        projected_util = (
            scenario_utilization_pct
            if scenario_utilization_pct is not None
            else baseline_utilization_pct
        )
        util_passed = projected_util <= 100.0

        # In-stock SLA
        in_stock_passed = baseline_in_stock_rate >= 95.0

        results = [
            {
                "rule": "Private Brand Share >= 25%",
                "passed": pb_passed,
                "actual_value": f"{projected_pb:.1f}%",
            },
            {
                "rule": "Shelf Capacity <= 100%",
                "passed": util_passed,
                "actual_value": f"{projected_util:.1f}%",
            },
            {
                "rule": "In-Stock SLA >= 95%",
                "passed": in_stock_passed,
                "actual_value": f"{baseline_in_stock_rate:.1f}%",
            },
        ]

        all_passed = pb_passed and util_passed and in_stock_passed
        return all_passed, results

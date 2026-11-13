"""Pricing Engine Service for actuarial calculations and loss modeling."""

from typing import Dict, Any, List


class PricingEngine:
    @staticmethod
    def calculate_technical_premium(
        expected_loss: float,
        risk_load: float | None = None,
        expense_load: float | None = None,
    ) -> Dict[str, float]:
        r_load = risk_load if risk_load is not None else round(expected_loss * 0.32, 2)
        e_load = (
            expense_load if expense_load is not None else round(expected_loss * 0.20, 2)
        )
        tech_premium = round(expected_loss + r_load + e_load, 2)
        return {
            "expected_loss": expected_loss,
            "risk_load": r_load,
            "expense_load": e_load,
            "technical_premium": tech_premium,
        }

    @staticmethod
    def simulate_loss_distribution(expected_loss: float) -> List[Dict[str, Any]]:
        return [
            {
                "return_period": "10-Year",
                "loss_estimate": round(expected_loss * 0.4, 2),
                "probability": 0.10,
            },
            {
                "return_period": "25-Year",
                "loss_estimate": round(expected_loss * 0.9, 2),
                "probability": 0.04,
            },
            {
                "return_period": "50-Year",
                "loss_estimate": round(expected_loss * 1.8, 2),
                "probability": 0.02,
            },
            {
                "return_period": "100-Year",
                "loss_estimate": round(expected_loss * 3.5, 2),
                "probability": 0.01,
            },
        ]

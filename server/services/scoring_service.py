from server.schemas import RiskCategory, RiskScoreBreakdown, RiskScoreResponse


class RiskScoringService:
    @staticmethod
    def calculate_risk_score(
        risk_category: str | RiskCategory,
        policy_limit_usd: float,
        attachment_point_usd: float,
        carrier_rating: str,
        industry_sector: str,
        prior_loss_amount_usd: float = 0.0,
    ) -> RiskScoreResponse:
        category_str = (
            risk_category.value
            if isinstance(risk_category, RiskCategory)
            else str(risk_category).upper()
        )
        rating_clean = carrier_rating.strip().upper()
        sector_clean = industry_sector.strip().lower()

        # 1. Exposure Score (Target ~ 10.0 to 40.0)
        # Ratio of requested limit to attachment point (defaulting attachment floor to 1M)
        effective_attach = max(attachment_point_usd, 1_000_000.0)
        ratio = policy_limit_usd / effective_attach
        limit_in_millions = policy_limit_usd / 1_000_000.0

        # Calibration: $10M / $5M attachment gives ratio 2.0 and ~30.0 exposure
        # $20M / $10M gives ratio 2.0 and ~30.0 exposure
        raw_exposure = 20.0 + (ratio * 4.0) + min(10.0, limit_in_millions * 0.2)
        exposure_score = round(min(40.0, max(5.0, raw_exposure)), 1)

        # 2. Carrier Rating Penalty (Target ~ 0.0 to 25.0)
        if "A++" in rating_clean:
            rating_penalty = 5.0
        elif "A+" in rating_clean:
            rating_penalty = 8.0
        elif "A" in rating_clean:
            rating_penalty = 10.0
        elif "B++" in rating_clean:
            rating_penalty = 15.0
        elif "B+" in rating_clean:
            rating_penalty = 18.0
        elif "B" in rating_clean:
            rating_penalty = 22.0
        else:
            rating_penalty = 25.0

        carrier_rating_penalty = round(rating_penalty, 1)

        # 3. Category Baseline + Sector Hazard (Target ~ 15.0 to 25.0)
        if category_str == "DO":
            base = 20.0
            if any(
                sec in sector_clean
                for sec in ["bio", "tech", "pharma", "finance", "crypto", "banking"]
            ):
                base += 2.0
            category_baseline = round(base, 1)
        else:  # CYBER
            base = 18.0
            if any(
                sec in sector_clean
                for sec in [
                    "logistics",
                    "supply",
                    "health",
                    "retail",
                    "cloud",
                    "tech",
                    "finance",
                ]
            ):
                base += 2.5
            category_baseline = round(base, 1)

        # 4. Loss History Factor (Target ~ 5.0 to 25.0)
        if prior_loss_amount_usd <= 0:
            loss_history_factor = 5.5
        elif prior_loss_amount_usd <= 250_000:
            loss_history_factor = 12.0
        elif prior_loss_amount_usd <= 500_000:
            loss_history_factor = 16.0
        elif prior_loss_amount_usd <= 1_000_000:
            loss_history_factor = 20.0
        else:
            loss_history_factor = 24.0

        loss_history_factor = round(loss_history_factor, 1)

        # Composite total score capped at [0, 100]
        total_score = round(
            min(
                100.0,
                max(
                    0.0,
                    exposure_score
                    + carrier_rating_penalty
                    + category_baseline
                    + loss_history_factor,
                ),
            ),
            1,
        )

        # Priority & Risk Grade derivation
        if total_score < 40.0:
            risk_grade = "LOW"
            priority = "LOW"
        elif total_score < 70.0:
            risk_grade = "MODERATE"
            priority = "MEDIUM"
        elif total_score < 85.0:
            risk_grade = "ELEVATED"
            priority = "HIGH"
        else:
            risk_grade = "SEVERE"
            priority = "CRITICAL"

        breakdown = RiskScoreBreakdown(
            exposure_score=exposure_score,
            carrier_rating_penalty=carrier_rating_penalty,
            category_baseline=category_baseline,
            loss_history_factor=loss_history_factor,
        )

        return RiskScoreResponse(
            risk_score=total_score,
            risk_grade=risk_grade,
            priority=priority,
            breakdown=breakdown,
        )

import json
from typing import Dict, Tuple, Optional
from server.models.submission import Submission
from server.models.risk_profile import CyberRiskProfile, DoRiskProfile


class RiskScoringEngine:
    @staticmethod
    def calculate_score(
        submission: Submission,
        cyber_profile: Optional[CyberRiskProfile] = None,
        do_profile: Optional[DoRiskProfile] = None,
    ) -> Tuple[float, str, str]:
        factors: Dict[str, float] = {}
        risk_type = (submission.risk_type or "").upper()

        # Financial exposure metrics
        exposure_factor = 0.0
        if submission.primary_limit > 0:
            ceded_ratio = submission.ceded_limit / submission.primary_limit
            if ceded_ratio >= 0.8:
                exposure_factor += 10.0
            elif ceded_ratio >= 0.5:
                exposure_factor += 5.0

            if submission.attachment_point < submission.primary_limit:
                exposure_factor += 5.0
        factors["financial_exposure"] = round(exposure_factor, 1)

        if risk_type == "CYBER":
            base = 45.0
            score = base
            factors["base_cyber_risk"] = base

            if cyber_profile:
                # Security controls evaluation
                if cyber_profile.mfa_enabled is True:
                    score -= 15.0
                    factors["mfa_credit"] = -15.0
                elif (
                    cyber_profile.mfa_enabled is False
                    or cyber_profile.mfa_enabled is None
                ):
                    score += 20.0
                    factors["mfa_deficiency_penalty"] = 20.0

                if cyber_profile.edr_implemented is True:
                    score -= 10.0
                    factors["edr_credit"] = -10.0
                else:
                    score += 15.0
                    factors["edr_deficiency_penalty"] = 15.0

                if cyber_profile.offline_backups is True:
                    score -= 10.0
                    factors["offline_backups_credit"] = -10.0
                else:
                    score += 15.0
                    factors["backups_deficiency_penalty"] = 15.0

                if cyber_profile.encryption_at_rest is True:
                    score -= 5.0
                    factors["encryption_credit"] = -5.0
                else:
                    score += 10.0
                    factors["encryption_deficiency_penalty"] = 10.0

                if cyber_profile.security_training is True:
                    score -= 5.0
                    factors["training_credit"] = -5.0
                else:
                    score += 5.0
                    factors["training_omission_penalty"] = 5.0

                # Data record volume
                rec_count = cyber_profile.record_count or 0
                if rec_count > 5_000_000:
                    score += 20.0
                    factors["high_data_volume_penalty"] = 20.0
                elif rec_count > 1_000_000:
                    score += 10.0
                    factors["medium_data_volume_penalty"] = 10.0
                elif rec_count > 200_000:
                    score += 5.0
                    factors["moderate_data_volume_penalty"] = 5.0

                # Loss history
                if cyber_profile.prior_ransomware_claims:
                    score += 20.0
                    factors["prior_ransomware_claims_penalty"] = 20.0
                    if (cyber_profile.prior_claims_amount or 0) > 500_000:
                        score += 10.0
                        factors["large_loss_amount_penalty"] = 10.0
            else:
                score += 30.0
                factors["missing_cyber_profile_penalty"] = 30.0

            score += exposure_factor

        elif risk_type == "DO":
            base = 40.0
            score = base
            factors["base_do_risk"] = base

            if do_profile:
                # Financial leverage
                lev = do_profile.leverage_ratio or 0.0
                if lev > 4.0:
                    score += 25.0
                    factors["high_leverage_penalty"] = 25.0
                elif lev > 2.5:
                    score += 15.0
                    factors["elevated_leverage_penalty"] = 15.0
                elif lev > 1.5:
                    score += 5.0
                    factors["moderate_leverage_penalty"] = 5.0

                # Executive turnover
                turnover = do_profile.executive_turnover_rate or 0.0
                if turnover > 25.0:
                    score += 25.0
                    factors["severe_executive_turnover_penalty"] = 25.0
                elif turnover > 15.0:
                    score += 15.0
                    factors["high_executive_turnover_penalty"] = 15.0
                elif turnover > 8.0:
                    score += 5.0
                    factors["moderate_executive_turnover_penalty"] = 5.0

                # Litigation and Regulatory
                if do_profile.active_litigation:
                    score += 25.0
                    factors["active_litigation_penalty"] = 25.0
                if do_profile.regulatory_investigations:
                    score += 20.0
                    factors["regulatory_investigation_penalty"] = 20.0

                # Board governance
                if do_profile.independent_board_charter is True:
                    score -= 10.0
                    factors["governance_board_credit"] = -10.0
                elif do_profile.independent_board_charter is False:
                    score += 15.0
                    factors["lack_board_charter_penalty"] = 15.0
            else:
                score += 30.0
                factors["missing_do_profile_penalty"] = 30.0

            score += exposure_factor

        else:
            score = 50.0
            factors["default_baseline"] = 50.0

        # Normalize score between 0.0 and 100.0
        normalized_score = max(0.0, min(100.0, score))
        final_score = round(normalized_score, 1)

        # Determine risk tier
        if final_score < 40.0:
            tier = "LOW"
        elif final_score <= 70.0:
            tier = "MEDIUM"
        else:
            tier = "HIGH"

        return final_score, tier, json.dumps(factors)

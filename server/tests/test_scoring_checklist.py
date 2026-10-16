from server.models import ReinsuranceSubmission
from server.services.scoring_engine import (
    calculate_risk_score,
    get_detailed_scoring_breakdown,
)


def test_scoring_engine_cyber_variations():
    # Strong Cyber risk posture
    low_risk_cyber = ReinsuranceSubmission(
        id="sub-low",
        risk_type="CYBER",
        insured_name="Safe Co",
        industry_sector="Education",
        limit_requested=2000000.0,
        attachment_point=1000000.0,
        retention=1000000.0,  # leverage 2.0x
        prior_loss_count=0,
        prior_loss_total=0.0,
        risk_attributes={
            "mfa_enabled": True,
            "edr_deployed": True,
            "backup_frequency": "DAILY_IMMUTABLE",
            "encryption_at_rest": True,
            "past_breaches": 0,
        },
    )
    score_low, tier_low = calculate_risk_score(low_risk_cyber)
    assert score_low <= 30
    assert tier_low == "LOW"

    # Weak Cyber risk posture
    high_risk_cyber = ReinsuranceSubmission(
        id="sub-high",
        risk_type="CYBER",
        insured_name="Risky Crypto Co",
        industry_sector="Cryptocurrency",
        limit_requested=20000000.0,
        attachment_point=5000000.0,
        retention=500000.0,  # leverage 40.0x
        prior_loss_count=3,
        prior_loss_total=12000000.0,
        risk_attributes={
            "mfa_enabled": False,
            "edr_deployed": False,
            "backup_frequency": "WEEKLY",
            "encryption_at_rest": False,
            "past_breaches": 2,
        },
    )
    score_high, tier_high = calculate_risk_score(high_risk_cyber)
    assert score_high >= 70
    assert tier_high in ["HIGH", "CRITICAL"]

    breakdown = get_detailed_scoring_breakdown(high_risk_cyber)
    assert breakdown["risk_score"] == score_high
    assert len(breakdown["factors"]) > 0


def test_scoring_engine_d_and_o_variations():
    clean_dand_o = ReinsuranceSubmission(
        id="sub-do-clean",
        risk_type="D_AND_O",
        insured_name="Stable Manufacturing Inc",
        industry_sector="Manufacturing",
        limit_requested=5000000.0,
        attachment_point=5000000.0,
        retention=2000000.0,
        prior_loss_count=0,
        prior_loss_total=0.0,
        risk_attributes={
            "pending_litigation": False,
            "debt_to_equity_ratio": 0.8,
            "board_experience_years": 12,
            "public_company": False,
        },
    )
    score_do, tier_do = calculate_risk_score(clean_dand_o)
    assert score_do <= 30
    assert tier_do == "LOW"

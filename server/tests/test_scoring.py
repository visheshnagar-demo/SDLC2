from server.models import ReinsuranceSubmission, RiskProfile, SubmissionDocument
from server.services.flagging_engine import evaluate_missing_information
from server.services.scoring_engine import calculate_risk_score


def test_scoring_and_flagging_cyber_complete():
    submission = ReinsuranceSubmission(
        risk_type="CYBER",
        insured_name="Cyber Safe Corp",
        industry_sector="Technology",
        annual_revenue=100000000.0,
        primary_policy_limit=10000000.0,
        requested_reinsurance_limit=5000000.0,
        attachment_point=5000000.0,
    )
    profile = RiskProfile(
        prior_losses_count=0,
        total_loss_amount=0.0,
        security_framework="SOC2_TYPE2",
        mfa_enforced=True,
        has_offline_backups=True,
        has_pending_claims=False,
    )
    docs = [
        SubmissionDocument(
            document_type="PRIMARY_POLICY_SCHEDULE",
            file_name="Schedule.pdf",
            file_size_bytes=1000,
        ),
        SubmissionDocument(
            document_type="LOSS_RUN_REPORT",
            file_name="LossRuns.pdf",
            file_size_bytes=1000,
        ),
    ]

    flags = evaluate_missing_information(submission, profile, docs)
    assert len(flags) == 0

    score = calculate_risk_score(submission, profile, docs, flags)
    assert score["overall_score"] >= 70.0
    assert score["risk_tier"] == "PREFERRED"
    assert score["completeness_score"] == 100.0


def test_scoring_and_flagging_cyber_missing_info():
    submission = ReinsuranceSubmission(
        risk_type="CYBER",
        insured_name="Incomplete Corp",
        industry_sector="Retail",
        annual_revenue=1000000.0,
        primary_policy_limit=5000000.0,
        requested_reinsurance_limit=5000000.0,
        attachment_point=0.0,
    )
    profile = RiskProfile(
        prior_losses_count=2,
        total_loss_amount=500000.0,
        mfa_enforced=False,
        has_offline_backups=False,
        has_pending_claims=True,
    )
    docs = []  # No docs

    flags = evaluate_missing_information(submission, profile, docs)
    assert len(flags) >= 2
    assert any(f["field_name"] == "primary_policy_schedule" for f in flags)
    assert any(f["field_name"] == "mfa_enforcement" for f in flags)

    score = calculate_risk_score(submission, profile, docs, flags)
    assert score["overall_score"] < 50.0
    assert score["risk_tier"] in ("HIGH_RISK", "MODERATE_RISK")

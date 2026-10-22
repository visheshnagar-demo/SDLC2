import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from server.models import RiskFactorBreakdown, Submission
from server.schemas import FactorScoreItemSchema, RiskScoreResponseSchema


def calculate_risk_score(
    line_of_business: str, attributes: dict[str, Any]
) -> tuple[int, str, list[FactorScoreItemSchema]]:
    factor_items: list[FactorScoreItemSchema] = []
    composite_score = 0

    if line_of_business == "Cyber Risk":
        mfa = bool(attributes.get("hasMfa", True))
        edr = bool(attributes.get("hasEdr", True))
        backups = bool(attributes.get("hasBackups", True))
        prior_losses = int(attributes.get("priorLossCount", 0))
        training = bool(attributes.get("hasTraining", True))

        mfa_pts = 20 if mfa else 0
        edr_pts = 15 if edr else 0
        backup_pts = 15 if backups else 0
        loss_pts = 30 if prior_losses == 0 else (15 if prior_losses <= 2 else 0)
        training_pts = 20 if training else 0

        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Technical Controls",
                factorName="MFA Enforcement",
                pointsEarned=mfa_pts,
                maxPoints=20,
                evaluationNotes="MFA active across enterprise"
                if mfa
                else "MFA not fully enforced",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Technical Controls",
                factorName="EDR Deployment",
                pointsEarned=edr_pts,
                maxPoints=15,
                evaluationNotes="Endpoint Detection & Response active"
                if edr
                else "Missing central EDR",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Operational Resilience",
                factorName="Immutable Backups",
                pointsEarned=backup_pts,
                maxPoints=15,
                evaluationNotes="Air-gapped / immutable backups present"
                if backups
                else "Backup controls insufficient",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Loss History",
                factorName="3-Year Prior Claims",
                pointsEarned=loss_pts,
                maxPoints=30,
                evaluationNotes=f"Prior claims count: {prior_losses}",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Human Factors",
                factorName="Security Awareness Training",
                pointsEarned=training_pts,
                maxPoints=20,
                evaluationNotes="Quarterly phishing tests passed"
                if training
                else "No structured awareness program",
            )
        )
        composite_score = mfa_pts + edr_pts + backup_pts + loss_pts + training_pts

    elif line_of_business == "D&O":
        financial_health = str(attributes.get("financialStrength", "Strong"))
        claims_count = int(attributes.get("priorClaimsCount", 0))
        governance = bool(attributes.get("independentBoard", True))
        regulatory_history = bool(attributes.get("regulatoryInquiries", False))

        fin_pts = (
            30
            if financial_health == "Strong"
            else (15 if financial_health == "Moderate" else 5)
        )
        claims_pts = 35 if claims_count == 0 else (20 if claims_count <= 1 else 0)
        gov_pts = 20 if governance else 10
        reg_pts = 15 if not regulatory_history else 0

        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Financial Strength",
                factorName="Balance Sheet Liquidity & D/E",
                pointsEarned=fin_pts,
                maxPoints=30,
                evaluationNotes=f"Financial health assessed as {financial_health}",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Claims Record",
                factorName="Historical D&O Securities Litigation",
                pointsEarned=claims_pts,
                maxPoints=35,
                evaluationNotes=f"Prior claims count: {claims_count}",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Corporate Governance",
                factorName="Independent Board Majority",
                pointsEarned=gov_pts,
                maxPoints=20,
                evaluationNotes="Majority independent board members"
                if governance
                else "Inside board control",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Compliance",
                factorName="Clean Regulatory Record",
                pointsEarned=reg_pts,
                maxPoints=15,
                evaluationNotes="No active regulatory inquiries"
                if not regulatory_history
                else "Prior regulatory inquiries noted",
            )
        )
        composite_score = fin_pts + claims_pts + gov_pts + reg_pts

    else:
        # General specialty scoring (E&O, EPLI, MPL)
        prior_losses = int(attributes.get("priorLossCount", 0))
        experience_years = int(attributes.get("experienceYears", 10))
        risk_controls = bool(attributes.get("standardRiskControls", True))

        loss_pts = 40 if prior_losses == 0 else (20 if prior_losses <= 2 else 5)
        exp_pts = (
            30 if experience_years >= 10 else (20 if experience_years >= 5 else 10)
        )
        ctrl_pts = 30 if risk_controls else 10

        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Loss Experience",
                factorName="Historical Loss Ratio & Claims",
                pointsEarned=loss_pts,
                maxPoints=40,
                evaluationNotes=f"Claims record: {prior_losses}",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Underwriting Experience",
                factorName="Industry Tenure & Maturity",
                pointsEarned=exp_pts,
                maxPoints=30,
                evaluationNotes=f"Operating tenure: {experience_years} years",
            )
        )
        factor_items.append(
            FactorScoreItemSchema(
                factorCategory="Operating Procedures",
                factorName="Standard Risk Protocols",
                pointsEarned=ctrl_pts,
                maxPoints=30,
                evaluationNotes="Documented risk mitigation protocols"
                if risk_controls
                else "Informal risk management",
            )
        )
        composite_score = loss_pts + exp_pts + ctrl_pts

    if composite_score >= 75:
        tier = "LOW"
    elif composite_score >= 50:
        tier = "MEDIUM"
    else:
        tier = "HIGH"

    return composite_score, tier, factor_items


def score_and_save_submission(
    db: Session, submission: Submission, attributes: dict[str, Any]
) -> RiskScoreResponseSchema:
    composite_score, tier, factor_items = calculate_risk_score(
        submission.line_of_business, attributes or {}
    )

    submission.risk_score = composite_score
    submission.risk_tier = tier

    # Clear old factors
    db.query(RiskFactorBreakdown).filter_by(submission_id=submission.id).delete()

    for item in factor_items:
        fb = RiskFactorBreakdown(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            factor_category=item.factorCategory,
            factor_name=item.factorName,
            score_awarded=item.pointsEarned,
            max_score=item.maxPoints,
            evaluation_notes=item.evaluationNotes,
            created_at=datetime.now(UTC),
        )
        db.add(fb)

    db.commit()
    db.refresh(submission)

    return RiskScoreResponseSchema(
        submissionId=submission.id,
        compositeScore=composite_score,
        riskTier=tier,
        factorBreakdown=factor_items,
        calculatedAt=datetime.now(UTC),
    )

import os
from datetime import date, datetime, timezone
import uuid
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from server.config import settings

DATABASE_URL = settings.DATABASE_URL
if settings.TESTING or DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if DATABASE_URL == "sqlite:///:memory:" or ":memory:" in DATABASE_URL:
        engine = create_engine(
            DATABASE_URL,
            connect_args=connect_args,
            poolclass=StaticPool,
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args=connect_args,
        )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(engine_override=None) -> None:
    # Ensure models are imported so they are registered with Base.metadata
    from server.models import (
        Submission,
        RiskScore,
        MissingInfoFlag,
        SubmissionAttachment,
        DecisionRecord,
    )
    target_engine = engine_override or engine
    Base.metadata.create_all(bind=target_engine)


def seed_data(db: Session) -> None:
    from server.models import (
        Submission,
        RiskScore,
        MissingInfoFlag,
        SubmissionAttachment,
        DecisionRecord,
    )
    from server.services.scoring_service import calculate_risk_score
    from server.services.validation_service import scan_missing_info

    # Check if sample submissions exist
    existing = db.query(Submission).first()
    if existing:
        return

    # Seed Cyber Sample Submission
    cyber_sub_id = str(uuid.uuid4())
    cyber_params = {
        "mfa_enforced": True,
        "edr_deployed": True,
        "backup_isolation": True,
        "security_audit_recency_months": 6,
        "prior_breaches_3yr": 0,
        "total_breach_losses": 0,
        "has_ransomware_questionnaire": True,
        "has_security_audit_report": True,
        "has_loss_runs_3yr": True,
    }
    cyber_sub = Submission(
        id=cyber_sub_id,
        carrier_id="CARRIER-001",
        carrier_name="Liberty Mutual Specialty",
        insured_name="Acme Cloud Technologies",
        industry_sector="Technology",
        annual_revenue=120000000.0,
        risk_type="CYBER",
        requested_limit=10000000.0,
        attachment_point=1000000.0,
        policy_effective_date=date(2026, 11, 1),
        policy_expiration_date=date(2027, 11, 1),
        status="SUBMITTED",
        submission_payload=cyber_params,
    )
    db.add(cyber_sub)
    db.flush()

    score_result = calculate_risk_score(
        risk_type="CYBER",
        requested_limit=10000000.0,
        attachment_point=1000000.0,
        annual_revenue=120000000.0,
        industry_sector="Technology",
        risk_parameters=cyber_params,
    )
    cyber_score = RiskScore(
        id=str(uuid.uuid4()),
        submission_id=cyber_sub_id,
        composite_score=score_result["composite_score"],
        risk_tier=score_result["risk_tier"],
        score_breakdown=score_result["score_breakdown"],
        scoring_rules_version="v1.0",
    )
    db.add(cyber_score)

    flags = scan_missing_info(
        risk_type="CYBER",
        submission_data={
            "carrier_id": "CARRIER-001",
            "carrier_name": "Liberty Mutual Specialty",
            "insured_name": "Acme Cloud Technologies",
            "industry_sector": "Technology",
            "annual_revenue": 120000000.0,
            "requested_limit": 10000000.0,
            "attachment_point": 1000000.0,
            "policy_effective_date": date(2026, 11, 1),
            "policy_expiration_date": date(2027, 11, 1),
            "risk_parameters": cyber_params,
        },
        attachments=["ransomware_questionnaire.pdf", "security_audit_2026.pdf", "loss_runs_3yr.pdf"],
    )
    for f in flags:
        flag_obj = MissingInfoFlag(
            id=str(uuid.uuid4()),
            submission_id=cyber_sub_id,
            item_key=f["item_key"],
            item_category=f["item_category"],
            description=f["description"],
            severity=f["severity"],
            is_resolved=f.get("is_resolved", False),
        )
        db.add(flag_obj)

    # Seed D&O Sample Submission with missing flags
    dno_sub_id = str(uuid.uuid4())
    dno_params = {
        "debt_to_equity_ratio": 2.8,
        "market_cap": 450000000.0,
        "prior_claims_3yr": 2,
        "regulatory_investigations": 1,
        "shareholder_suits": 1,
        "board_tenure_years": 3.0,
        "independent_board_pct": 50.0,
        "has_audited_financials": False,
        "has_loss_runs_3yr": False,
        "has_governance_statement": True,
    }
    dno_sub = Submission(
        id=dno_sub_id,
        carrier_id="CARRIER-002",
        carrier_name="Travelers Syndicate",
        insured_name="Global Retail Holdings Inc",
        industry_sector="Retail",
        annual_revenue=550000000.0,
        risk_type="D_AND_O",
        requested_limit=25000000.0,
        attachment_point=5000000.0,
        policy_effective_date=date(2026, 12, 1),
        policy_expiration_date=2027-12-1 if isinstance(2027-12-1, date) else date(2027, 12, 1),
        status="UNDER_REVIEW",
        submission_payload=dno_params,
    )
    db.add(dno_sub)
    db.flush()

    dno_score_res = calculate_risk_score(
        risk_type="D_AND_O",
        requested_limit=25000000.0,
        attachment_point=5000000.0,
        annual_revenue=550000000.0,
        industry_sector="Retail",
        risk_parameters=dno_params,
    )
    dno_score = RiskScore(
        id=str(uuid.uuid4()),
        submission_id=dno_sub_id,
        composite_score=dno_score_res["composite_score"],
        risk_tier=dno_score_res["risk_tier"],
        score_breakdown=dno_score_res["score_breakdown"],
        scoring_rules_version="v1.0",
    )
    db.add(dno_score)

    dno_flags = scan_missing_info(
        risk_type="D_AND_O",
        submission_data={
            "carrier_id": "CARRIER-002",
            "carrier_name": "Travelers Syndicate",
            "insured_name": "Global Retail Holdings Inc",
            "industry_sector": "Retail",
            "annual_revenue": 550000000.0,
            "requested_limit": 25000000.0,
            "attachment_point": 5000000.0,
            "policy_effective_date": date(2026, 12, 1),
            "policy_expiration_date": date(2027, 12, 1),
            "risk_parameters": dno_params,
        },
        attachments=["governance_statement.pdf"],
    )
    for f in dno_flags:
        flag_obj = MissingInfoFlag(
            id=str(uuid.uuid4()),
            submission_id=dno_sub_id,
            item_key=f["item_key"],
            item_category=f["item_category"],
            description=f["description"],
            severity=f["severity"],
            is_resolved=f.get("is_resolved", False),
        )
        db.add(flag_obj)

    try:
        db.commit()
    except Exception:
        db.rollback()

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./facultative_reinsurance.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from server import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db=None):
    from server import models

    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Check if seed submissions exist
        existing = db.query(models.ReinsuranceSubmission).first()
        if not existing:
            sub = models.ReinsuranceSubmission(
                id="seed-cyber-001",
                tracking_number="FAC-2026-CY-0012",
                risk_type="CYBER",
                insured_name="Apex Global Financial Corp",
                industry_sector="Financial Services",
                annual_revenue=120000000.0,
                primary_policy_limit=25000000.0,
                requested_reinsurance_limit=10000000.0,
                attachment_point=15000000.0,
                policy_effective_date="2026-01-01",
                policy_expiration_date="2027-01-01",
                status="FLAGGED",
                overall_risk_score=62.5,
                risk_tier="HIGH",
                missing_flags_count=1,
            )
            db.add(sub)
            db.flush()

            profile = models.RiskProfile(
                id="seed-prof-001",
                submission_id=sub.id,
                claims_count_3yr=1,
                total_losses_3yr=450000.0,
                security_framework="NIST CSF",
                mfa_enforced=True,
                backup_immutable=True,
                board_governance_score=75.0,
                regulatory_enforcement_action=False,
                esg_risk_rating="A",
            )
            db.add(profile)

            flag = models.MissingInformationFlag(
                id="seed-flag-001",
                submission_id=sub.id,
                field_or_document_name="loss_history_declaration",
                description="Signed 3-year loss history declaration document missing",
                severity="HIGH",
                is_resolved=False,
            )
            db.add(flag)

            score = models.RiskScore(
                id="seed-score-001",
                submission_id=sub.id,
                composite_score=62.5,
                completeness_score=70.0,
                exposure_score=65.0,
                loss_history_score=55.0,
                governance_score=60.0,
                risk_tier="HIGH",
                benchmark_delta=4.2,
                notes="Elevated exposure relative to attachment point with unverified loss history.",
            )
            db.add(score)

            audit = models.AuditLog(
                id="seed-audit-001",
                submission_id=sub.id,
                actor_id="carrier_agent_01",
                actor_role="Carrier_Representative",
                action="SUBMISSION_CREATED",
                state_before=None,
                state_after="SUBMITTED",
                details="Initial submission created via Carrier Portal",
            )
            db.add(audit)

            db.commit()
    except Exception:
        db.rollback()
    finally:
        if should_close:
            db.close()

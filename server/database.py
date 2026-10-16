import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# For SQLite, ensure check_same_thread=False
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

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
    Base.metadata.create_all(bind=engine)


def seed_data(db_session=None):
    """Idempotently seed default carrier profiles and initial sample submissions."""
    from server.models import CarrierProfile, ReinsuranceSubmission
    from server.services.scoring_engine import calculate_risk_score
    from server.services.checklist_service import evaluate_checklist

    close_session = False
    if db_session is None:
        db_session = SessionLocal()
        close_session = True

    try:
        # Seed Carrier Profiles
        existing_carrier = (
            db_session.query(CarrierProfile)
            .filter_by(carrier_name="Apex Insurance Group")
            .first()
        )
        if not existing_carrier:
            carrier1 = CarrierProfile(
                id="c0000000-0000-0000-0000-000000000001",
                carrier_name="Apex Insurance Group",
                am_best_rating="A+",
                contact_email="underwriting@apexins.com",
                contact_phone="+1-212-555-0199",
            )
            carrier2 = CarrierProfile(
                id="c0000000-0000-0000-0000-000000000002",
                carrier_name="Beacon Specialty Mutual",
                am_best_rating="A",
                contact_email="placements@beaconspecialty.com",
                contact_phone="+1-312-555-0144",
            )
            carrier3 = CarrierProfile(
                id="c0000000-0000-0000-0000-000000000003",
                carrier_name="Vanguard Risk Partners",
                am_best_rating="A-",
                contact_email="facultative@vanguardrisk.com",
                contact_phone="+1-415-555-0182",
            )
            db_session.add_all([carrier1, carrier2, carrier3])
            db_session.commit()

        # Seed sample submission if empty
        existing_sub = (
            db_session.query(ReinsuranceSubmission)
            .filter_by(insured_name="FinTech Global Corp")
            .first()
        )
        if not existing_sub:
            sub1 = ReinsuranceSubmission(
                id="s0000000-0000-0000-0000-000000000001",
                carrier_id="c0000000-0000-0000-0000-000000000001",
                risk_type="CYBER",
                insured_name="FinTech Global Corp",
                industry_sector="Financial Services",
                annual_revenue=150000000.0,
                employee_count=1200,
                limit_requested=10000000.0,
                attachment_point=5000000.0,
                retention=1000000.0,
                effective_date="2026-07-01",
                expiry_date="2027-07-01",
                prior_loss_count=1,
                prior_loss_total=250000.0,
                risk_attributes={
                    "mfa_enabled": True,
                    "edr_deployed": True,
                    "backup_frequency": "DAILY_IMMUTABLE",
                    "encryption_at_rest": True,
                    "past_breaches": 0,
                    "cloud_hosted": True,
                },
                notes="Primary cyber layer placement requested. Seeking $10M excess of $5M attachment.",
                status="SUBMITTED",
            )
            score, tier = calculate_risk_score(sub1)
            sub1.risk_score = score
            sub1.risk_tier = tier
            db_session.add(sub1)
            db_session.commit()

            # Evaluate initial missing flags
            evaluate_checklist(db_session, sub1.id)

    except Exception:
        db_session.rollback()
    finally:
        if close_session:
            db_session.close()

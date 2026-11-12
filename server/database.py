import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

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


def seed_data(db):
    from server.models.submission import Submission
    from server.models.risk_profile import CyberRiskProfile, DoRiskProfile
    from server.models.evaluation import RiskScore, MissingInfoFlag, AuditLog

    # Seed sample submissions if none exist
    if db.query(Submission).count() == 0:
        sub1 = Submission(
            id=str(uuid.uuid4()),
            carrier_name="Apex Mutual Assurance",
            insured_name="Globex Cyber Dynamics",
            risk_type="CYBER",
            primary_limit=5000000.0,
            attachment_point=10000000.0,
            ceded_limit=2500000.0,
            carrier_premium=150000.0,
            policy_start_date="2026-06-01",
            policy_end_date="2027-06-01",
            status="PENDING",
            risk_score=78.5,
            risk_tier="HIGH",
        )
        db.add(sub1)
        db.flush()

        cyber_prof = CyberRiskProfile(
            id=str(uuid.uuid4()),
            submission_id=sub1.id,
            mfa_enabled=False,
            edr_implemented=True,
            offline_backups=False,
            encryption_at_rest=True,
            record_count=2500000,
            prior_ransomware_claims=True,
            prior_claims_amount=450000.0,
            security_training=True,
        )
        db.add(cyber_prof)

        flag1 = MissingInfoFlag(
            id=str(uuid.uuid4()),
            submission_id=sub1.id,
            field_name="mfa_enabled",
            flag_code="MISSING_MFA_DETAILS",
            description="Missing MFA confirmation across enterprise administrative access",
            severity="HIGH",
            is_resolved=False,
        )
        flag2 = MissingInfoFlag(
            id=str(uuid.uuid4()),
            submission_id=sub1.id,
            field_name="offline_backups",
            flag_code="MISSING_BACKUP_CONTROLS",
            description="Offline immutable backup strategy disclosure required",
            severity="MEDIUM",
            is_resolved=False,
        )
        db.add_all([flag1, flag2])

        score1 = RiskScore(
            id=str(uuid.uuid4()),
            submission_id=sub1.id,
            overall_score=78.5,
            risk_tier="HIGH",
            breakdown_json='{"base": 50.0, "mfa_penalty": 20.0, "backup_penalty": 10.0, "claim_penalty": 15.0, "record_penalty": 10.0, "edr_credit": -15.0, "encryption_credit": -10.0, "exposure_factor": 8.5}',
        )
        db.add(score1)

        sub2 = Submission(
            id=str(uuid.uuid4()),
            carrier_name="Sentinel Global Underwriting",
            insured_name="Initech Financial Holdings",
            risk_type="DO",
            primary_limit=10000000.0,
            attachment_point=15000000.0,
            ceded_limit=5000000.0,
            carrier_premium=280000.0,
            policy_start_date="2026-07-01",
            policy_end_date="2027-07-01",
            status="PENDING",
            risk_score=42.0,
            risk_tier="MEDIUM",
        )
        db.add(sub2)
        db.flush()

        do_prof = DoRiskProfile(
            id=str(uuid.uuid4()),
            submission_id=sub2.id,
            leverage_ratio=2.4,
            executive_turnover_rate=12.5,
            active_litigation=False,
            litigation_details=None,
            independent_board_charter=True,
            regulatory_investigations=False,
            annual_revenue=85000000.0,
        )
        db.add(do_prof)

        score2 = RiskScore(
            id=str(uuid.uuid4()),
            submission_id=sub2.id,
            overall_score=42.0,
            risk_tier="MEDIUM",
            breakdown_json='{"base": 40.0, "leverage_factor": 5.0, "turnover_factor": 5.0, "board_credit": -10.0, "exposure_factor": 2.0}',
        )
        db.add(score2)

        audit1 = AuditLog(
            id=str(uuid.uuid4()),
            submission_id=sub1.id,
            action="SUBMISSION_INGESTED",
            details="Ingested cyber submission for Globex Cyber Dynamics with risk score 78.5",
        )
        db.add(audit1)

        try:
            db.commit()
        except Exception:
            db.rollback()

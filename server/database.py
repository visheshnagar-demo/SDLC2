import uuid
from datetime import date
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from server.config import settings

connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models.user import User
    from server.models.submission import ReinsuranceSubmission
    from server.models.risk_score import RiskScoreBreakdown
    from server.models.missing_flag import MissingInformationFlag

    # Seed Users
    carrier_email = "test@example.com"
    carrier = db.query(User).filter(User.email == carrier_email).first()
    if not carrier:
        carrier = User(
            id=str(uuid.uuid4()),
            email=carrier_email,
            hashed_password=hash_password("testpassword"),
            full_name="Carrier Test User",
            role="carrier",
            company_name="Liberty Mutual Ceding Group",
            is_active=True,
        )
        db.add(carrier)

    admin_email = "admin@example.com"
    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email=admin_email,
            hashed_password=hash_password("adminpassword"),
            full_name="Admin Underwriter",
            role="underwriter",
            company_name="Global Reinsurance Ltd",
            is_active=True,
        )
        db.add(admin)

    underwriter_email = "underwriter@example.com"
    underwriter = db.query(User).filter(User.email == underwriter_email).first()
    if not underwriter:
        underwriter = User(
            id=str(uuid.uuid4()),
            email=underwriter_email,
            hashed_password=hash_password("underwriterpassword"),
            full_name="Lead Underwriter",
            role="underwriter",
            company_name="Global Reinsurance Ltd",
            is_active=True,
        )
        db.add(underwriter)

    try:
        db.commit()
    except Exception:
        db.rollback()

    # Re-fetch carrier
    carrier = db.query(User).filter(User.email == carrier_email).first()
    if carrier:
        # Check if submissions exist
        sub_count = db.query(ReinsuranceSubmission).count()
        if sub_count == 0:
            sub1_id = str(uuid.uuid4())
            sub1 = ReinsuranceSubmission(
                id=sub1_id,
                submission_reference="FAC-2026-CYB-0012",
                carrier_id=carrier.id,
                risk_type="CYBER",
                insured_name="Apex Cloud Systems Inc.",
                industry_segment="Technology",
                annual_revenue=150000000.0,
                sum_insured=10000000.0,
                attachment_point=2000000.0,
                policy_start_date=date(2026, 7, 1),
                policy_end_date=date(2027, 7, 1),
                prior_claims_count=1,
                prior_claims_total=250000.0,
                security_governance_score=82.5,
                status="SUBMITTED",
                risk_score=75,
                risk_tier="HIGH",
            )
            db.add(sub1)

            # Score breakdown for sub1
            breakdown1 = RiskScoreBreakdown(
                id=str(uuid.uuid4()),
                submission_id=sub1_id,
                rule_key="CYBER_HIGH_REVENUE_EXPOSURE",
                rule_name="High Revenue Exposure vs Attachment Point",
                score_delta=25,
                rationale="Attachment point of $2M represents 1.33% of annual revenue ($150M), indicating high primary loss sensitivity.",
            )
            breakdown2 = RiskScoreBreakdown(
                id=str(uuid.uuid4()),
                submission_id=sub1_id,
                rule_key="CYBER_PRIOR_CLAIMS",
                rule_name="Historical Cyber Claims Severity",
                score_delta=30,
                rationale="1 prior claim totaling $250k recorded in the past 3 years.",
            )
            breakdown3 = RiskScoreBreakdown(
                id=str(uuid.uuid4()),
                submission_id=sub1_id,
                rule_key="CYBER_SECURITY_HYGIENE",
                rule_name="Security Hygiene Score",
                score_delta=20,
                rationale="Security hygiene score of 82.5 meets baseline standards.",
            )
            db.add_all([breakdown1, breakdown2, breakdown3])

            # Missing info flags for sub1
            flag1 = MissingInformationFlag(
                id=str(uuid.uuid4()),
                submission_id=sub1_id,
                flag_code="MISSING_ATTACHMENT",
                field_name="CYBER_ASSESSMENT",
                severity="BLOCKING",
                message="Cyber Assessment Questionnaire is required before issuing a binding quote.",
                is_resolved=False,
            )
            flag2 = MissingInformationFlag(
                id=str(uuid.uuid4()),
                submission_id=sub1_id,
                flag_code="MISSING_ATTACHMENT",
                field_name="LOSS_RUNS",
                severity="WARNING",
                message="Loss run schedule document is recommended for claims verification.",
                is_resolved=False,
            )
            db.add_all([flag1, flag2])

            # Seed D&O submission
            sub2_id = str(uuid.uuid4())
            sub2 = ReinsuranceSubmission(
                id=sub2_id,
                submission_reference="FAC-2026-DNO-0045",
                carrier_id=carrier.id,
                risk_type="D_AND_O",
                insured_name="Meridian Healthcare Corp",
                industry_segment="Healthcare",
                annual_revenue=85000000.0,
                sum_insured=5000000.0,
                attachment_point=5000000.0,
                policy_start_date=date(2026, 8, 1),
                policy_end_date=date(2027, 8, 1),
                prior_claims_count=0,
                prior_claims_total=0.0,
                security_governance_score=90.0,
                status="SUBMITTED",
                risk_score=35,
                risk_tier="LOW",
            )
            db.add(sub2)

            breakdown_dno = RiskScoreBreakdown(
                id=str(uuid.uuid4()),
                submission_id=sub2_id,
                rule_key="DNO_CLEAN_LOSS_HISTORY",
                rule_name="Clean Loss History",
                score_delta=15,
                rationale="Zero prior claims or executive litigation incidents in past 5 years.",
            )
            db.add(breakdown_dno)

            try:
                db.commit()
            except Exception:
                db.rollback()

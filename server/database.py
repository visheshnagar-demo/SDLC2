import uuid
from typing import Generator
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from server.config import settings

engine_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
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
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def init_db() -> None:
    # Import all models to ensure they are registered on Base.metadata
    from server.models import (  # noqa: F401
        Organization,
        User,
        Submission,
        SubmissionDocument,
        RiskScore,
        Quote,
        SubmissionAuditLog,
        ScoringRuleConfig,
    )

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session) -> None:
    from server.models import (
        Organization,
        User,
        ScoringRuleConfig,
    )

    try:
        # Seed Organizations
        reinsurer = (
            db.query(Organization)
            .filter_by(name="Global Re Specialty Underwriters")
            .first()
        )
        if not reinsurer:
            reinsurer = Organization(
                id=str(uuid.uuid4()),
                name="Global Re Specialty Underwriters",
                org_type="REINSURER",
            )
            db.add(reinsurer)
            db.flush()

        hartford = (
            db.query(Organization)
            .filter_by(name="Hartford General Insurance Corp")
            .first()
        )
        if not hartford:
            hartford = Organization(
                id="HGIC-770",
                name="Hartford General Insurance Corp",
                org_type="CEDING",
            )
            db.add(hartford)
            db.flush()

        travelers = (
            db.query(Organization)
            .filter_by(name="Travelers National Syndicate")
            .first()
        )
        if not travelers:
            travelers = Organization(
                id="TNS-104",
                name="Travelers National Syndicate",
                org_type="CEDING",
            )
            db.add(travelers)
            db.flush()

        # Seed Users
        test_users = [
            {
                "email": "test@example.com",
                "full_name": "Test User",
                "role": "RE_UNDERWRITER",
                "org_id": reinsurer.id,
                "password": "testpassword",
                "authority_limit": settings.UNDERWRITER_DEFAULT_AUTHORITY_LIMIT,
            },
            {
                "email": "admin@example.com",
                "full_name": "Eleanor Vance (CUO)",
                "role": "UNDERWRITING_MANAGER",
                "org_id": reinsurer.id,
                "password": "adminpassword",
                "authority_limit": settings.MANAGER_DEFAULT_AUTHORITY_LIMIT,
            },
            {
                "email": "underwriter@example.com",
                "full_name": "Marcus Vance (Underwriter)",
                "role": "RE_UNDERWRITER",
                "org_id": reinsurer.id,
                "password": "testpassword",
                "authority_limit": settings.UNDERWRITER_DEFAULT_AUTHORITY_LIMIT,
            },
            {
                "email": "ceding@example.com",
                "full_name": "Sarah Jenkins (Cedent)",
                "role": "CEDING_UNDERWRITER",
                "org_id": hartford.id,
                "password": "testpassword",
                "authority_limit": 0.0,
            },
        ]

        for u_data in test_users:
            existing = db.query(User).filter_by(email=u_data["email"]).first()
            if not existing:
                user = User(
                    id=str(uuid.uuid4()),
                    email=u_data["email"],
                    hashed_password=hash_password(u_data["password"]),
                    full_name=u_data["full_name"],
                    role=u_data["role"],
                    org_id=u_data["org_id"],
                    authority_limit=u_data["authority_limit"],
                    is_active=True,
                    is_verified=True,
                )
                db.add(user)

        # Seed Default Scoring Rules if not present
        default_lobs = [
            {
                "line_of_business": "CYBER",
                "display_name": "Cyber Risk",
                "description": "Rules for evaluating enterprise cybersecurity posture, controls, and loss history",
                "max_score": 100,
                "rules_json": {
                    "factors": [
                        {
                            "key": "mfa_enforced",
                            "name": "MFA Enforcement Across All Access",
                            "max_points": 20,
                            "default_pass": True,
                        },
                        {
                            "key": "edr_coverage",
                            "name": "EDR Coverage > 95% Endpoints",
                            "max_points": 20,
                            "default_pass": True,
                        },
                        {
                            "key": "immutable_backups",
                            "name": "Air-Gapped & Immutable Backups",
                            "max_points": 15,
                            "default_pass": True,
                        },
                        {
                            "key": "loss_ratio_low",
                            "name": "3-Yr Prior Loss Ratio < 30%",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "revenue_stability",
                            "name": "Revenue Band & Security Spend Stability",
                            "max_points": 20,
                            "default_pass": True,
                        },
                    ],
                    "mandatory_documents": [
                        "APPLICATION",
                        "LOSS_RUNS",
                        "SECURITY_AUDIT",
                    ],
                },
                "authority_limit_threshold": 5000000.0,
                "warning_sla_hours": 24.0,
                "breach_sla_hours": 48.0,
            },
            {
                "line_of_business": "DO",
                "display_name": "Directors & Officers (D&O)",
                "description": "Rules for evaluating executive governance, financial liquidity, and legal history",
                "max_score": 100,
                "rules_json": {
                    "factors": [
                        {
                            "key": "current_ratio_healthy",
                            "name": "Current Ratio > 1.5 & Positive Cash Flow",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "clean_claims_history",
                            "name": "5-Yr Clean Securities Litigation / Regulatory History",
                            "max_points": 30,
                            "default_pass": True,
                        },
                        {
                            "key": "board_independence",
                            "name": "Independent Board Majority & Audit Committee",
                            "max_points": 20,
                            "default_pass": True,
                        },
                        {
                            "key": "profitability",
                            "name": "Consistent Operating Margin & Financial Strength",
                            "max_points": 25,
                            "default_pass": True,
                        },
                    ],
                    "mandatory_documents": [
                        "APPLICATION",
                        "LOSS_RUNS",
                        "AUDITED_FINANCIALS",
                    ],
                },
                "authority_limit_threshold": 5000000.0,
                "warning_sla_hours": 24.0,
                "breach_sla_hours": 48.0,
            },
            {
                "line_of_business": "EO",
                "display_name": "Errors & Omissions (E&O)",
                "description": "Professional liability rules evaluating service contracts and QA procedures",
                "max_score": 100,
                "rules_json": {
                    "factors": [
                        {
                            "key": "standard_contracts",
                            "name": "Standardized Client Contracts with Limitation of Liability",
                            "max_points": 30,
                            "default_pass": True,
                        },
                        {
                            "key": "qa_peer_review",
                            "name": "Formal QA & Peer Review Procedures",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "clean_loss_record",
                            "name": "No Severe Prior Professional Claims in 3 Years",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "client_concentration_low",
                            "name": "No Single Client > 20% Revenue",
                            "max_points": 20,
                            "default_pass": True,
                        },
                    ],
                    "mandatory_documents": ["APPLICATION", "LOSS_RUNS"],
                },
                "authority_limit_threshold": 5000000.0,
                "warning_sla_hours": 24.0,
                "breach_sla_hours": 48.0,
            },
            {
                "line_of_business": "EPLI",
                "display_name": "Employment Practices Liability (EPLI)",
                "description": "Rules evaluating HR oversight, employee turnover, and dispute resolution",
                "max_score": 100,
                "rules_json": {
                    "factors": [
                        {
                            "key": "written_hr_policies",
                            "name": "Written Anti-Harassment & Equal Opportunity Handbooks",
                            "max_points": 30,
                            "default_pass": True,
                        },
                        {
                            "key": "mandatory_training",
                            "name": "Annual Mandatory Workplace Conduct Training",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "low_turnover_rate",
                            "name": "Annual Employee Turnover < 15%",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "clean_eeoc_record",
                            "name": "Zero Open EEOC or Class-Action Filings",
                            "max_points": 20,
                            "default_pass": True,
                        },
                    ],
                    "mandatory_documents": ["APPLICATION", "LOSS_RUNS", "HR_POLICIES"],
                },
                "authority_limit_threshold": 5000000.0,
                "warning_sla_hours": 24.0,
                "breach_sla_hours": 48.0,
            },
            {
                "line_of_business": "MEDMAL",
                "display_name": "Medical Professional Liability",
                "description": "Rules evaluating clinical credentialing, doctor-to-patient ratio, and malpractice history",
                "max_score": 100,
                "rules_json": {
                    "factors": [
                        {
                            "key": "board_certified_staff",
                            "name": "100% Attending Physicians Board Certified",
                            "max_points": 30,
                            "default_pass": True,
                        },
                        {
                            "key": "incident_reporting_system",
                            "name": "Active Electronic Clinical Incident Reporting",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "favorable_claims_frequency",
                            "name": "Claims Frequency < Specialty National Benchmark",
                            "max_points": 25,
                            "default_pass": True,
                        },
                        {
                            "key": "accreditation_standing",
                            "name": "Joint Commission / AAAHC Full Accreditation",
                            "max_points": 20,
                            "default_pass": True,
                        },
                    ],
                    "mandatory_documents": [
                        "APPLICATION",
                        "LOSS_RUNS",
                        "CREDENTIALING_REPORT",
                    ],
                },
                "authority_limit_threshold": 5000000.0,
                "warning_sla_hours": 24.0,
                "breach_sla_hours": 48.0,
            },
        ]

        for lob_item in default_lobs:
            cfg = (
                db.query(ScoringRuleConfig)
                .filter_by(line_of_business=lob_item["line_of_business"])
                .first()
            )
            if not cfg:
                rule_config = ScoringRuleConfig(
                    id=str(uuid.uuid4()),
                    line_of_business=lob_item["line_of_business"],
                    display_name=lob_item["display_name"],
                    description=lob_item["description"],
                    max_score=lob_item["max_score"],
                    rules_json=lob_item["rules_json"],
                    authority_limit_threshold=lob_item["authority_limit_threshold"],
                    warning_sla_hours=lob_item["warning_sla_hours"],
                    breach_sla_hours=lob_item["breach_sla_hours"],
                )
                db.add(rule_config)

        db.commit()
    except Exception:
        db.rollback()

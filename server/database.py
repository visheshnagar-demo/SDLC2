import os
import uuid
from datetime import date
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./reinsurance.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine=None) -> None:
    """Idempotently create all tables."""
    eng = target_engine or engine
    Base.metadata.create_all(bind=eng)


def seed_data(db: Session) -> None:
    """Idempotently seed sample submissions and underwriter review records."""
    from server.models import (
        ReinsuranceSubmission,
        SubmissionDocument,
        SubmissionMissingFlag,
        UnderwritingDecision,
    )

    existing_count = db.query(ReinsuranceSubmission).count()
    if existing_count > 0:
        return

    # Sample 1: Cyber request with missing questionnaire flag
    sub1_id = str(uuid.uuid4())
    sub1 = ReinsuranceSubmission(
        id=sub1_id,
        submission_reference="FAC-2026-CYB-00437",
        carrier_name="Acme Mutual Insurance Co.",
        carrier_rating="A+",
        risk_category="CYBER",
        insured_entity_name="Apex Global Logistics Inc.",
        industry_sector="Logistics & Supply Chain",
        policy_limit_usd=10000000.00,
        attachment_point_usd=5000000.00,
        effective_date=date(2026, 6, 1),
        expiration_date=date(2027, 6, 1),
        primary_policy_number="POL-CYB-2026-8819",
        prior_loss_amount_usd=250000.00,
        risk_score=72.5,
        priority="HIGH",
        status="SUBMITTED",
        has_missing_info=True,
    )
    db.add(sub1)

    doc1 = SubmissionDocument(
        id=str(uuid.uuid4()),
        submission_id=sub1_id,
        document_type="PRIMARY_POLICY",
        file_name="apex_primary_policy_schedule.pdf",
        file_size_bytes=1048576,
        storage_uri="gs://reinsurance-docs/2026/apex_primary_policy_schedule.pdf",
    )
    db.add(doc1)

    flag1 = SubmissionMissingFlag(
        id=str(uuid.uuid4()),
        submission_id=sub1_id,
        field_name="CYBER_QUESTIONNAIRE",
        flag_message="Missing Information: Cyber Security Assessment Questionnaire Required",
        is_blocking=True,
        is_resolved=False,
    )
    db.add(flag1)

    # Sample 2: D&O request complete with elevated score
    sub2_id = str(uuid.uuid4())
    sub2 = ReinsuranceSubmission(
        id=sub2_id,
        submission_reference="FAC-2026-DO-00102",
        carrier_name="Beacon Specialty Underwriters",
        carrier_rating="A",
        risk_category="DO",
        insured_entity_name="BioVanguard Therapeutics Ltd.",
        industry_sector="Biotechnology",
        policy_limit_usd=20000000.00,
        attachment_point_usd=10000000.00,
        effective_date=date(2026, 7, 1),
        expiration_date=date(2027, 7, 1),
        primary_policy_number="POL-DO-2026-4401",
        prior_loss_amount_usd=500000.00,
        risk_score=78.0,
        priority="HIGH",
        status="SUBMITTED",
        has_missing_info=False,
    )
    db.add(sub2)

    doc2_1 = SubmissionDocument(
        id=str(uuid.uuid4()),
        submission_id=sub2_id,
        document_type="AUDITED_FINANCIALS",
        file_name="biovanguard_audited_financials_2025.pdf",
        file_size_bytes=2097152,
        storage_uri="gs://reinsurance-docs/2026/biovanguard_audited_financials_2025.pdf",
    )
    doc2_2 = SubmissionDocument(
        id=str(uuid.uuid4()),
        submission_id=sub2_id,
        document_type="BOARD_OWNERSHIP",
        file_name="biovanguard_governance_roster.pdf",
        file_size_bytes=524288,
        storage_uri="gs://reinsurance-docs/2026/biovanguard_governance_roster.pdf",
    )
    doc2_3 = SubmissionDocument(
        id=str(uuid.uuid4()),
        submission_id=sub2_id,
        document_type="PRIOR_ACTS_CLAIMS",
        file_name="biovanguard_loss_run_5yr.pdf",
        file_size_bytes=786432,
        storage_uri="gs://reinsurance-docs/2026/biovanguard_loss_run_5yr.pdf",
    )
    db.add_all([doc2_1, doc2_2, doc2_3])

    # Sample 3: Quoted submission
    sub3_id = str(uuid.uuid4())
    sub3 = ReinsuranceSubmission(
        id=sub3_id,
        submission_reference="FAC-2026-CYB-00088",
        carrier_name="Continental Casualty Re",
        carrier_rating="A++",
        risk_category="CYBER",
        insured_entity_name="Nexus Cloud Systems Corp.",
        industry_sector="Information Technology",
        policy_limit_usd=5000000.00,
        attachment_point_usd=2500000.00,
        effective_date=date(2026, 5, 1),
        expiration_date=date(2027, 5, 1),
        primary_policy_number="POL-CYB-2026-1120",
        prior_loss_amount_usd=0.00,
        risk_score=38.5,
        priority="LOW",
        status="QUOTED",
        has_missing_info=False,
    )
    db.add(sub3)

    dec3 = UnderwritingDecision(
        id=str(uuid.uuid4()),
        submission_id=sub3_id,
        underwriter_id="UW-8842",
        decision="QUOTE",
        quoted_premium_usd=75000.00,
        quoted_limit_usd=5000000.00,
        quoted_attachment_usd=2500000.00,
        notes="Clean loss history and top-tier cloud architecture controls.",
    )
    db.add(dec3)

    db.commit()

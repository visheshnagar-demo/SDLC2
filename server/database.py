import json
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from server.models import Base, Quote, RiskExposure, PolicyBinder

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///:memory:")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool if ":memory:" in DATABASE_URL else None,
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def parse_iso_datetime(dt_str: str) -> datetime:
    if not dt_str:
        return datetime.now(timezone.utc)
    try:
        if dt_str.endswith("Z"):
            dt_str = dt_str[:-1] + "+00:00"
        return datetime.fromisoformat(dt_str)
    except Exception:
        return datetime.now(timezone.utc)


def seed_data(db: Session) -> None:
    data_dir = Path(__file__).resolve().parent / "data"

    # Quotes
    quotes_file = data_dir / "synthetic-quotes.json"
    if quotes_file.exists():
        with open(quotes_file, "r", encoding="utf-8") as f:
            quotes_data = json.load(f)
            for q in quotes_data:
                existing = db.query(Quote).filter(Quote.id == q["id"]).first()
                if not existing:
                    quote_obj = Quote(
                        id=q["id"],
                        quote_number=q["quoteNumber"],
                        insured_name=q["insuredName"],
                        line_of_business=q["lineOfBusiness"],
                        sum_insured=float(q["sumInsured"]),
                        deductible=float(q.get("deductible", 0.0)),
                        structure_type=q["structureType"],
                        attachment_point=float(q.get("attachmentPoint", 0.0)),
                        quoted_premium=float(q["quotedPremium"]),
                        rate_on_line=float(q["rateOnLine"]),
                        ceding_commission=float(q.get("cedingCommission", 0.0)),
                        status=q.get("status", "QUOTED"),
                        created_at=parse_iso_datetime(q.get("createdAt")),
                        updated_at=parse_iso_datetime(q.get("updatedAt")),
                    )
                    db.add(quote_obj)
        db.commit()

    # Risks
    risks_file = data_dir / "synthetic-risks.json"
    if risks_file.exists():
        with open(risks_file, "r", encoding="utf-8") as f:
            risks_data = json.load(f)
            for r in risks_data:
                existing = db.query(RiskExposure).filter(RiskExposure.id == r["id"]).first()
                if not existing:
                    risk_obj = RiskExposure(
                        id=r["id"],
                        quote_id=r["quoteId"],
                        total_exposure=float(r["totalExposure"]),
                        probable_maximum_loss=float(r["probableMaximumLoss"]),
                        cat_risk_score=int(r.get("catRiskScore", 50)),
                        underwriting_decision=r.get("underwritingDecision", "PENDING"),
                        underwriter_notes=r.get("underwriterNotes", ""),
                        layers=r.get("layers", []),
                    )
                    db.add(risk_obj)
        db.commit()

    # Binders
    binders_file = data_dir / "synthetic-binders.json"
    if binders_file.exists():
        with open(binders_file, "r", encoding="utf-8") as f:
            binders_data = json.load(f)
            for b in binders_data:
                existing = db.query(PolicyBinder).filter(PolicyBinder.id == b["id"]).first()
                if not existing:
                    binder_obj = PolicyBinder(
                        id=b["id"],
                        policy_reference_id=b["policyReferenceId"],
                        quote_id=b["quoteId"],
                        effective_date=b.get("effectiveDate", "2026-06-01"),
                        expiry_date=b.get("expiryDate", "2027-06-01"),
                        bound_by=b.get("boundBy", "UW-4091"),
                        binding_timestamp=parse_iso_datetime(b.get("bindingTimestamp")),
                        status=b.get("status", "BOUND"),
                        document_summary=b.get("documentSummary", {}),
                    )
                    db.add(binder_obj)
        db.commit()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

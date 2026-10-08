import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/motor_insurance.db")

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
    # Import models here so that they register on Base.metadata
    from server import models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session = None):
    # Idempotent seed function for audit history and testing
    from server.models import Quote, QuoteFactor
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Check if any quotes exist
        existing_quote = db.query(Quote).first()
        if not existing_quote:
            seed_quote_id = "9b1deb4d-3b7d-4bad-a859-994158e60a36"
            quote = Quote(
                id=seed_quote_id,
                vehicle_make="Toyota",
                vehicle_year=2022,
                vehicle_value=25000.0,
                driver_age=30,
                driving_experience=5,
                coverage_type="Comprehensive",
                base_premium=500.0,
                total_premium=1200.0,
                currency="USD",
                status="Bound",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(quote)
            
            factors = [
                QuoteFactor(
                    id=str(uuid.uuid4()),
                    quote_id=seed_quote_id,
                    factor_name="Base Tariff Premium",
                    amount=500.0,
                    category="base",
                    description="Standard base tariff rate"
                ),
                QuoteFactor(
                    id=str(uuid.uuid4()),
                    quote_id=seed_quote_id,
                    factor_name="Vehicle Value Loading (1.2%)",
                    amount=300.0,
                    category="vehicle",
                    description="1.2% loading on vehicle valuation of $25,000.00"
                ),
                QuoteFactor(
                    id=str(uuid.uuid4()),
                    quote_id=seed_quote_id,
                    factor_name="Driver Age Adjustment (26-35)",
                    amount=100.0,
                    category="driver",
                    description="Age bracket risk adjustment for 26-35"
                ),
                QuoteFactor(
                    id=str(uuid.uuid4()),
                    quote_id=seed_quote_id,
                    factor_name="Driving Experience Discount (5 yrs)",
                    amount=-100.0,
                    category="experience",
                    description="$100.00 discount based on 5 years of clean driving experience"
                ),
                QuoteFactor(
                    id=str(uuid.uuid4()),
                    quote_id=seed_quote_id,
                    factor_name="Comprehensive Coverage Surcharge",
                    amount=400.0,
                    category="coverage",
                    description="Full comprehensive coverage surcharge"
                ),
            ]
            for factor in factors:
                db.add(factor)

            db.commit()
    except Exception:
        db.rollback()
    finally:
        if close_db:
            db.close()

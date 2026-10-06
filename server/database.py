import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

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
    """Create all tables in the database idempotently."""
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    """Seed initial data idempotently for KPIs, SKUs, and Scenarios."""
    from server.models import KPIModel, SKUModel, ScenarioModel

    # Seed KPIs
    existing_kpis = db.query(KPIModel).all()
    if not existing_kpis:
        default_kpis = [
            KPIModel(
                metric_name="sales_per_linear_ft",
                value=428.50,
                unit="USD",
                target_value=396.00,
                status_text="+8.2% vs target",
            ),
            KPIModel(
                metric_name="private_brand_percentage",
                value=24.5,
                unit="%",
                target_value=25.0,
                status_text="Goal: 25.0%",
            ),
            KPIModel(
                metric_name="in_stock_rate",
                value=96.8,
                unit="%",
                target_value=95.0,
                status_text="Target: 95.0% (SLA Met)",
            ),
            KPIModel(
                metric_name="shelf_capacity",
                value=142.0,
                unit="LF",
                target_value=150.0,
                status_text="94.6% Utilized",
            ),
        ]
        db.add_all(default_kpis)
        db.commit()

    # Seed SKUs
    existing_skus = db.query(SKUModel).all()
    if not existing_skus:
        default_skus = [
            SKUModel(
                sku_id="SKU-10842",
                name="DG Clover Valley Potato Chips 10oz",
                category="Snacks",
                sales=14250.0,
                movement=4200,
                margin_percentage=38.5,
                velocity=1.8,
                recommended_action="GROW",
            ),
            SKUModel(
                sku_id="SKU-20911",
                name="Brand X Crunchy Pretzels 12oz",
                category="Snacks",
                sales=8100.0,
                movement=1800,
                margin_percentage=22.1,
                velocity=0.9,
                recommended_action="SWAP",
            ),
            SKUModel(
                sku_id="SKU-30124",
                name="DG Value Tortilla Chips 14oz",
                category="Snacks",
                sales=11800.0,
                movement=3100,
                margin_percentage=35.2,
                velocity=1.4,
                recommended_action="MAINTAIN",
            ),
            SKUModel(
                sku_id="SKU-40582",
                name="Slow-Moving Corn Curls 8oz",
                category="Snacks",
                sales=2400.0,
                movement=600,
                margin_percentage=18.0,
                velocity=0.4,
                recommended_action="REDUCE",
            ),
            SKUModel(
                sku_id="SKU-50912",
                name="DG Clover Valley Trail Mix 16oz",
                category="Snacks",
                sales=13100.0,
                movement=3800,
                margin_percentage=41.0,
                velocity=1.6,
                recommended_action="GROW",
            ),
        ]
        db.add_all(default_skus)
        db.commit()

    # Seed Scenarios
    existing_scenarios = db.query(ScenarioModel).all()
    if not existing_scenarios:
        default_scenarios = [
            ScenarioModel(
                scenario_type="Conservative",
                description="Low Disruption",
                projected_sales_increase_pct=3.5,
                private_brand_change_pct=0.8,
                shelf_utilization_pct=92.0,
                is_preselected=False,
            ),
            ScenarioModel(
                scenario_type="Balanced",
                description="Optimal GMROI & Target Alignment",
                projected_sales_increase_pct=7.8,
                private_brand_change_pct=1.5,
                shelf_utilization_pct=95.0,
                is_preselected=True,
            ),
            ScenarioModel(
                scenario_type="Aggressive",
                description="Maximum Margin Expansion",
                projected_sales_increase_pct=14.2,
                private_brand_change_pct=3.2,
                shelf_utilization_pct=98.5,
                is_preselected=False,
            ),
        ]
        db.add_all(default_scenarios)
        db.commit()

import os
import uuid
from datetime import datetime, timezone
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assortment_advisor.db")

# For SQLite, ensure check_same_thread is False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models here to ensure metadata registration
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session) -> None:
    from server.models import StoreCluster, SkuItem, ScenarioConfig

    # Seed Cluster
    cluster = (
        db.query(StoreCluster)
        .filter(StoreCluster.cluster_code == "STV-CLUSTER-01")
        .first()
    )
    if not cluster:
        cluster = StoreCluster(
            id=str(uuid.uuid4()),
            cluster_code="STV-CLUSTER-01",
            cluster_name="Small Town Value Cluster",
            category="Snacks",
            sales_per_linear_ft=125.00,
            private_brand_pct=32.0,
            in_stock_rate_pct=96.5,
            shelf_capacity_pct=88.0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(cluster)
        db.commit()
        db.refresh(cluster)

    # Seed SKUs
    existing_skus_count = (
        db.query(SkuItem).filter(SkuItem.cluster_id == cluster.id).count()
    )
    if existing_skus_count == 0:
        skus_data = [
            {
                "sku_code": "DG-SNK-001",
                "name": "DG Crave Potato Chips 10oz",
                "brand_type": "PRIVATE_BRAND",
                "weekly_sales_units": 450,
                "sales_volume_usd": 1125.00,
                "margin_pct": 38.5,
                "linear_space_inches": 14.0,
                "recommended_action": "GROW",
                "status_badge_color": "green",
            },
            {
                "sku_code": "DG-SNK-002",
                "name": "Clover Valley Tortilla Chips 13oz",
                "brand_type": "PRIVATE_BRAND",
                "weekly_sales_units": 410,
                "sales_volume_usd": 1025.00,
                "margin_pct": 39.0,
                "linear_space_inches": 15.0,
                "recommended_action": "GROW",
                "status_badge_color": "green",
            },
            {
                "sku_code": "DG-SNK-003",
                "name": "DG Crave Gummy Bears 8oz",
                "brand_type": "PRIVATE_BRAND",
                "weekly_sales_units": 380,
                "sales_volume_usd": 760.00,
                "margin_pct": 42.0,
                "linear_space_inches": 10.0,
                "recommended_action": "GROW",
                "status_badge_color": "green",
            },
            {
                "sku_code": "DG-SNK-004",
                "name": "Clover Valley Pretzels 16oz",
                "brand_type": "PRIVATE_BRAND",
                "weekly_sales_units": 290,
                "sales_volume_usd": 725.00,
                "margin_pct": 36.0,
                "linear_space_inches": 12.0,
                "recommended_action": "MAINTAIN",
                "status_badge_color": "blue",
            },
            {
                "sku_code": "NAT-SNK-101",
                "name": "National Classic Potato Chips 9.5oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 520,
                "sales_volume_usd": 1820.00,
                "margin_pct": 24.5,
                "linear_space_inches": 18.0,
                "recommended_action": "MAINTAIN",
                "status_badge_color": "blue",
            },
            {
                "sku_code": "NAT-SNK-102",
                "name": "Cheesy Puffs Extreme 8.5oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 340,
                "sales_volume_usd": 1190.00,
                "margin_pct": 23.0,
                "linear_space_inches": 14.0,
                "recommended_action": "MAINTAIN",
                "status_badge_color": "blue",
            },
            {
                "sku_code": "NAT-SNK-103",
                "name": "Mountain Ridge Trail Mix 6oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 210,
                "sales_volume_usd": 840.00,
                "margin_pct": 25.0,
                "linear_space_inches": 10.0,
                "recommended_action": "MAINTAIN",
                "status_badge_color": "blue",
            },
            {
                "sku_code": "NAT-SNK-104",
                "name": "Brand X Tortilla Chips 12oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 180,
                "sales_volume_usd": 630.00,
                "margin_pct": 22.0,
                "linear_space_inches": 16.0,
                "recommended_action": "SWAP",
                "status_badge_color": "yellow",
            },
            {
                "sku_code": "NAT-SNK-105",
                "name": "Super Crunch Popcorn 5oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 150,
                "sales_volume_usd": 525.00,
                "margin_pct": 20.5,
                "linear_space_inches": 14.0,
                "recommended_action": "SWAP",
                "status_badge_color": "yellow",
            },
            {
                "sku_code": "NAT-SNK-106",
                "name": "Zesty Salsa Dip 15oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 130,
                "sales_volume_usd": 455.00,
                "margin_pct": 21.0,
                "linear_space_inches": 12.0,
                "recommended_action": "SWAP",
                "status_badge_color": "yellow",
            },
            {
                "sku_code": "NAT-SNK-107",
                "name": "Stale Brand Corn Chips 10oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 85,
                "sales_volume_usd": 255.00,
                "margin_pct": 18.0,
                "linear_space_inches": 14.0,
                "recommended_action": "REDUCE",
                "status_badge_color": "red",
            },
            {
                "sku_code": "NAT-SNK-108",
                "name": "Slow-Moving Pretzel Sticks 12oz",
                "brand_type": "NATIONAL_BRAND",
                "weekly_sales_units": 70,
                "sales_volume_usd": 210.00,
                "margin_pct": 17.5,
                "linear_space_inches": 12.0,
                "recommended_action": "REDUCE",
                "status_badge_color": "red",
            },
        ]
        for item in skus_data:
            sku = SkuItem(
                id=str(uuid.uuid4()),
                cluster_id=cluster.id,
                sku_code=item["sku_code"],
                name=item["name"],
                brand_type=item["brand_type"],
                weekly_sales_units=item["weekly_sales_units"],
                sales_volume_usd=item["sales_volume_usd"],
                margin_pct=item["margin_pct"],
                linear_space_inches=item["linear_space_inches"],
                recommended_action=item["recommended_action"],
                status_badge_color=item["status_badge_color"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(sku)
        db.commit()

    # Seed Scenario Configs
    existing_scenarios = db.query(ScenarioConfig).count()
    if existing_scenarios == 0:
        scenarios_data = [
            {
                "scenario_type": "CONSERVATIVE",
                "scenario_name": "Conservative Stability",
                "description": "Minimizes SKU churn with cautious adjustments while safeguarding in-stock reliability and core margin.",
                "is_default": False,
                "sales_delta_percentage": 2.1,
                "margin_delta_percentage": 1.2,
                "private_brand_mix_delta": 1.0,
                "shelf_capacity_projected_percentage": 86.0,
            },
            {
                "scenario_type": "BALANCED",
                "scenario_name": "Balanced Optimization",
                "description": "Recommended strategy optimizing private brand share and linear feet revenue while maintaining customer loyalty.",
                "is_default": True,
                "sales_delta_percentage": 5.4,
                "margin_delta_percentage": 2.4,
                "private_brand_mix_delta": 2.5,
                "shelf_capacity_projected_percentage": 89.5,
            },
            {
                "scenario_type": "AGGRESSIVE",
                "scenario_name": "Aggressive Growth",
                "description": "Maximizes private label expansion and linear profitability with high SKU turnover in underperforming slots.",
                "is_default": False,
                "sales_delta_percentage": 8.5,
                "margin_delta_percentage": 3.1,
                "private_brand_mix_delta": 4.2,
                "shelf_capacity_projected_percentage": 92.5,
            },
        ]
        for s in scenarios_data:
            sc = ScenarioConfig(
                id=str(uuid.uuid4()),
                scenario_type=s["scenario_type"],
                scenario_name=s["scenario_name"],
                description=s["description"],
                is_default=s["is_default"],
                sales_delta_percentage=s["sales_delta_percentage"],
                margin_delta_percentage=s["margin_delta_percentage"],
                private_brand_mix_delta=s["private_brand_mix_delta"],
                shelf_capacity_projected_percentage=s[
                    "shelf_capacity_projected_percentage"
                ],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(sc)
        db.commit()

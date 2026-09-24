import os
import json
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from server.models import Base, Cluster, SKU, Scenario

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


DEFAULT_CLUSTER_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"


def seed_data(db: Session) -> None:
    # 1. Seed Cluster
    cluster = db.query(Cluster).filter(Cluster.id == DEFAULT_CLUSTER_ID).first()
    if not cluster:
        cluster = Cluster(
            id=DEFAULT_CLUSTER_ID,
            name="Small Town Value Cluster",
            code="STV-SNACKS-01",
            category="Snacks",
            total_linear_feet=48.0,
        )
        db.add(cluster)
        db.commit()
        db.refresh(cluster)

    # 2. Seed Scenarios
    scenarios_data = [
        {
            "id": "7a1b2c3d-0001-4000-8000-000000000001",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "scenario_type": "CONSERVATIVE",
            "name": "Conservative",
            "description": "Lower risk, incremental assortment adjustments",
            "is_default": False,
            "projected_sales_delta_pct": 1.50,
            "projected_pb_shift_pct": 0.80,
            "projected_space_util_pct": 89.00,
            "min_private_brand_met": True,
            "capacity_threshold_met": True,
            "overall_guardrail_status": "PASSED",
            "add_count": 2,
            "keep_count": 35,
            "swap_count": 3,
            "remove_count": 2,
        },
        {
            "id": "7a1b2c3d-0002-4000-8000-000000000002",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "scenario_type": "BALANCED",
            "name": "Balanced",
            "description": "Standard optimized trade-off between sales velocity, shelf space, and private brand targets",
            "is_default": True,
            "projected_sales_delta_pct": 4.20,
            "projected_pb_shift_pct": 2.50,
            "projected_space_util_pct": 92.50,
            "min_private_brand_met": True,
            "capacity_threshold_met": True,
            "overall_guardrail_status": "PASSED",
            "add_count": 5,
            "keep_count": 30,
            "swap_count": 5,
            "remove_count": 2,
        },
        {
            "id": "7a1b2c3d-0003-4000-8000-000000000003",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "scenario_type": "AGGRESSIVE",
            "name": "Aggressive",
            "description": "Maximum growth focus with higher SKU turnover",
            "is_default": False,
            "projected_sales_delta_pct": 8.00,
            "projected_pb_shift_pct": 5.00,
            "projected_space_util_pct": 96.00,
            "min_private_brand_met": True,
            "capacity_threshold_met": False,
            "overall_guardrail_status": "WARNING",
            "add_count": 9,
            "keep_count": 24,
            "swap_count": 7,
            "remove_count": 2,
        },
    ]

    for s_data in scenarios_data:
        existing = db.query(Scenario).filter(Scenario.id == s_data["id"]).first()
        if not existing:
            sc = Scenario(**s_data)
            db.add(sc)
    db.commit()

    # 3. Seed SKUs
    skus_data = [
        {
            "id": "c3d1f11e-8e6d-491f-a3d8-5b4d7f5e1a2b",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-8821",
            "product_name": "Clover Valley Tortilla Chips 13oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Chips",
            "weekly_sales_volume": 420.0,
            "sales_per_linear_ft": 168.40,
            "linear_feet_allocated": 2.50,
            "in_stock_rate": 98.50,
            "status_badge": "GROW",
        },
        {
            "id": "e4f2a22b-9f7e-482a-b4e9-6c5e8f6a2b3c",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-4412",
            "product_name": "Brand X Pretzel Sticks 10oz",
            "brand_name": "Brand X",
            "is_private_brand": False,
            "sub_category": "Pretzels",
            "weekly_sales_volume": 125.0,
            "sales_per_linear_ft": 84.10,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 91.00,
            "status_badge": "SWAP",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000001",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-1001",
            "product_name": "Clover Valley Potato Chips Classic 8oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Chips",
            "weekly_sales_volume": 380.0,
            "sales_per_linear_ft": 155.20,
            "linear_feet_allocated": 2.00,
            "in_stock_rate": 97.80,
            "status_badge": "GROW",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000002",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-2002",
            "product_name": "Lay's Classic Potato Chips 8oz",
            "brand_name": "Lay's",
            "is_private_brand": False,
            "sub_category": "Chips",
            "weekly_sales_volume": 510.0,
            "sales_per_linear_ft": 190.00,
            "linear_feet_allocated": 3.00,
            "in_stock_rate": 99.10,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000003",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-2003",
            "product_name": "Doritos Nacho Cheese Tortilla Chips 9.25oz",
            "brand_name": "Doritos",
            "is_private_brand": False,
            "sub_category": "Chips",
            "weekly_sales_volume": 490.0,
            "sales_per_linear_ft": 182.50,
            "linear_feet_allocated": 2.50,
            "in_stock_rate": 98.40,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000004",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-1004",
            "product_name": "Clover Valley Sour Cream & Onion Chips 8oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Chips",
            "weekly_sales_volume": 310.0,
            "sales_per_linear_ft": 140.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 96.50,
            "status_badge": "GROW",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000005",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-3001",
            "product_name": "Clover Valley Mini Pretzel Twists 16oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Pretzels",
            "weekly_sales_volume": 210.0,
            "sales_per_linear_ft": 115.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 95.00,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000006",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-3002",
            "product_name": "Snyder's of Hanover Sourdough Hard Pretzels 13.5oz",
            "brand_name": "Snyder's",
            "is_private_brand": False,
            "sub_category": "Pretzels",
            "weekly_sales_volume": 180.0,
            "sales_per_linear_ft": 108.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 94.20,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000007",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-4001",
            "product_name": "Clover Valley Cheese Crackers 12.4oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Crackers",
            "weekly_sales_volume": 340.0,
            "sales_per_linear_ft": 148.00,
            "linear_feet_allocated": 2.00,
            "in_stock_rate": 97.20,
            "status_badge": "GROW",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000008",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-4002",
            "product_name": "Cheez-It Original Baked Snack Crackers 7oz",
            "brand_name": "Cheez-It",
            "is_private_brand": False,
            "sub_category": "Crackers",
            "weekly_sales_volume": 460.0,
            "sales_per_linear_ft": 175.00,
            "linear_feet_allocated": 2.50,
            "in_stock_rate": 98.00,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000009",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-5001",
            "product_name": "Clover Valley Roasted Salted Peanuts 16oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Nuts",
            "weekly_sales_volume": 290.0,
            "sales_per_linear_ft": 160.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 96.80,
            "status_badge": "GROW",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000010",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-5002",
            "product_name": "Planters Dry Roasted Peanuts 16oz",
            "brand_name": "Planters",
            "is_private_brand": False,
            "sub_category": "Nuts",
            "weekly_sales_volume": 310.0,
            "sales_per_linear_ft": 152.00,
            "linear_feet_allocated": 2.00,
            "in_stock_rate": 95.50,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000011",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-6001",
            "product_name": "Old Style Cheese Puffs 5oz",
            "brand_name": "Old Style",
            "is_private_brand": False,
            "sub_category": "Chips",
            "weekly_sales_volume": 65.0,
            "sales_per_linear_ft": 48.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 88.00,
            "status_badge": "REDUCE",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000012",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-6002",
            "product_name": "Budget Salted Popcorn 4oz",
            "brand_name": "Budget Pop",
            "is_private_brand": False,
            "sub_category": "Popcorn",
            "weekly_sales_volume": 70.0,
            "sales_per_linear_ft": 52.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 89.50,
            "status_badge": "REDUCE",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000013",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-7001",
            "product_name": "Clover Valley Butter Popcorn 6oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Popcorn",
            "weekly_sales_volume": 240.0,
            "sales_per_linear_ft": 132.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 96.00,
            "status_badge": "GROW",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000014",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-7002",
            "product_name": "Smartfood White Cheddar Popcorn 5.5oz",
            "brand_name": "Smartfood",
            "is_private_brand": False,
            "sub_category": "Popcorn",
            "weekly_sales_volume": 330.0,
            "sales_per_linear_ft": 164.00,
            "linear_feet_allocated": 2.00,
            "in_stock_rate": 97.50,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000015",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-CV-8001",
            "product_name": "Clover Valley Chocolate Chip Cookies 13oz",
            "brand_name": "Clover Valley",
            "is_private_brand": True,
            "sub_category": "Cookies",
            "weekly_sales_volume": 275.0,
            "sales_per_linear_ft": 142.00,
            "linear_feet_allocated": 1.50,
            "in_stock_rate": 96.40,
            "status_badge": "MAINTAIN",
        },
        {
            "id": "a1111111-1111-4000-8000-000000000016",
            "cluster_id": DEFAULT_CLUSTER_ID,
            "sku_code": "SNK-NB-8002",
            "product_name": "Oreo Chocolate Sandwich Cookies 14.3oz",
            "brand_name": "Oreo",
            "is_private_brand": False,
            "sub_category": "Cookies",
            "weekly_sales_volume": 480.0,
            "sales_per_linear_ft": 185.00,
            "linear_feet_allocated": 2.50,
            "in_stock_rate": 98.70,
            "status_badge": "MAINTAIN",
        },
    ]

    for sku_item in skus_data:
        existing = db.query(SKU).filter(SKU.id == sku_item["id"]).first()
        if not existing:
            sku_obj = SKU(**sku_item)
            db.add(sku_obj)
    db.commit()

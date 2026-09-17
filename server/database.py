import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assortment.db")

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
    # Import models so tables register on Base.metadata
    from server.models import assortment  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models.assortment import SKUModel, ScenarioProjectionModel
    import uuid

    # 1. Seed Scenarios if not present
    existing_scenarios = {
        s.scenario_key: s for s in db.query(ScenarioProjectionModel).all()
    }

    default_scenarios = [
        {
            "scenario_key": "conservative",
            "display_name": "Conservative",
            "description": "Focuses on risk mitigation and high in-stock stability.",
            "projected_sales_per_linear_ft": 435.00,
            "projected_private_brand_pct": 26.0,
            "projected_in_stock_rate_pct": 98.5,
            "projected_shelf_capacity_pct": 88.0,
            "action_grow_count": 3,
            "action_maintain_count": 14,
            "action_swap_count": 2,
            "action_reduce_count": 1,
        },
        {
            "scenario_key": "balanced",
            "display_name": "Balanced",
            "description": "Balances private brand growth with overall sales yield.",
            "projected_sales_per_linear_ft": 465.00,
            "projected_private_brand_pct": 29.5,
            "projected_in_stock_rate_pct": 96.2,
            "projected_shelf_capacity_pct": 92.0,
            "action_grow_count": 5,
            "action_maintain_count": 12,
            "action_swap_count": 3,
            "action_reduce_count": 2,
        },
        {
            "scenario_key": "aggressive",
            "display_name": "Aggressive",
            "description": "Maximizes private brand conversion and shelf space replacement.",
            "projected_sales_per_linear_ft": 490.00,
            "projected_private_brand_pct": 34.0,
            "projected_in_stock_rate_pct": 94.0,
            "projected_shelf_capacity_pct": 96.5,
            "action_grow_count": 8,
            "action_maintain_count": 8,
            "action_swap_count": 4,
            "action_reduce_count": 4,
        },
    ]

    for sc in default_scenarios:
        if sc["scenario_key"] not in existing_scenarios:
            obj = ScenarioProjectionModel(
                id=str(uuid.uuid4()),
                scenario_key=sc["scenario_key"],
                display_name=sc["display_name"],
                description=sc["description"],
                projected_sales_per_linear_ft=sc["projected_sales_per_linear_ft"],
                projected_private_brand_pct=sc["projected_private_brand_pct"],
                projected_in_stock_rate_pct=sc["projected_in_stock_rate_pct"],
                projected_shelf_capacity_pct=sc["projected_shelf_capacity_pct"],
                action_grow_count=sc["action_grow_count"],
                action_maintain_count=sc["action_maintain_count"],
                action_swap_count=sc["action_swap_count"],
                action_reduce_count=sc["action_reduce_count"],
            )
            db.add(obj)

    # 2. Seed SKUs if table empty
    existing_sku_count = db.query(SKUModel).count()
    if existing_sku_count == 0:
        default_skus = [
            {
                "sku_code": "SNK-1001",
                "product_name": "DG Clover Valley Potato Chips 10oz",
                "category": "Snacks",
                "weekly_sales": 1250.50,
                "margin_pct": 42.0,
                "shelf_space_ft": 2.5,
                "status_badge": "GROW",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1002",
                "product_name": "Lay's Classic Potato Chips 8oz",
                "category": "Snacks",
                "weekly_sales": 1850.00,
                "margin_pct": 28.5,
                "shelf_space_ft": 3.5,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1003",
                "product_name": "DG Clover Valley Tortilla Chips 13oz",
                "category": "Snacks",
                "weekly_sales": 980.00,
                "margin_pct": 44.0,
                "shelf_space_ft": 2.0,
                "status_badge": "GROW",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1004",
                "product_name": "Doritos Nacho Cheese 9.25oz",
                "category": "Snacks",
                "weekly_sales": 2100.00,
                "margin_pct": 26.0,
                "shelf_space_ft": 4.0,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1005",
                "product_name": "Cheetos Crunchy Cheese 8.5oz",
                "category": "Snacks",
                "weekly_sales": 1600.00,
                "margin_pct": 27.0,
                "shelf_space_ft": 3.0,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1006",
                "product_name": "DG Clover Valley Pretzels 16oz",
                "category": "Snacks",
                "weekly_sales": 420.00,
                "margin_pct": 48.0,
                "shelf_space_ft": 1.5,
                "status_badge": "SWAP",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1007",
                "product_name": "Snyder's Mini Pretzels 12oz",
                "category": "Snacks",
                "weekly_sales": 580.00,
                "margin_pct": 31.0,
                "shelf_space_ft": 2.0,
                "status_badge": "SWAP",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1008",
                "product_name": "DG Clover Valley Cheese Puffs 8oz",
                "category": "Snacks",
                "weekly_sales": 890.00,
                "margin_pct": 45.0,
                "shelf_space_ft": 2.0,
                "status_badge": "GROW",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1009",
                "product_name": "Pringles Original 5.2oz",
                "category": "Snacks",
                "weekly_sales": 1150.00,
                "margin_pct": 30.0,
                "shelf_space_ft": 2.0,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1010",
                "product_name": "Takis Fuego Rolled Tortilla 9.9oz",
                "category": "Snacks",
                "weekly_sales": 1420.00,
                "margin_pct": 29.0,
                "shelf_space_ft": 2.5,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1011",
                "product_name": "DG Clover Valley Gummy Bears 7oz",
                "category": "Snacks",
                "weekly_sales": 320.00,
                "margin_pct": 50.0,
                "shelf_space_ft": 1.0,
                "status_badge": "GROW",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1012",
                "product_name": "Haribo Goldbears 5oz",
                "category": "Snacks",
                "weekly_sales": 640.00,
                "margin_pct": 32.0,
                "shelf_space_ft": 1.5,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1013",
                "product_name": "DG Clover Valley Trail Mix 10oz",
                "category": "Snacks",
                "weekly_sales": 510.00,
                "margin_pct": 46.0,
                "shelf_space_ft": 1.5,
                "status_badge": "GROW",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1014",
                "product_name": "Planters Salted Peanuts 6oz",
                "category": "Snacks",
                "weekly_sales": 480.00,
                "margin_pct": 33.0,
                "shelf_space_ft": 1.5,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1015",
                "product_name": "Slow Sellers Jalapeno Crisps 6oz",
                "category": "Snacks",
                "weekly_sales": 110.00,
                "margin_pct": 22.0,
                "shelf_space_ft": 1.5,
                "status_badge": "REDUCE",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1016",
                "product_name": "Regional BBQ Rib Chips 5oz",
                "category": "Snacks",
                "weekly_sales": 140.00,
                "margin_pct": 24.0,
                "shelf_space_ft": 1.5,
                "status_badge": "REDUCE",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1017",
                "product_name": "DG Clover Valley Popcorn Butter 6ct",
                "category": "Snacks",
                "weekly_sales": 780.00,
                "margin_pct": 43.0,
                "shelf_space_ft": 2.0,
                "status_badge": "GROW",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1018",
                "product_name": "Orville Redenbacher Butter 6ct",
                "category": "Snacks",
                "weekly_sales": 820.00,
                "margin_pct": 28.0,
                "shelf_space_ft": 2.0,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1019",
                "product_name": "DG Clover Valley Beef Jerky 3oz",
                "category": "Snacks",
                "weekly_sales": 620.00,
                "margin_pct": 41.0,
                "shelf_space_ft": 1.5,
                "status_badge": "SWAP",
                "is_private_brand": True,
            },
            {
                "sku_code": "SNK-1020",
                "product_name": "Jack Link's Original Beef Jerky 2.85oz",
                "category": "Snacks",
                "weekly_sales": 950.00,
                "margin_pct": 25.0,
                "shelf_space_ft": 2.0,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1021",
                "product_name": "Sun Chips Harvest Cheddar 7oz",
                "category": "Snacks",
                "weekly_sales": 430.00,
                "margin_pct": 30.0,
                "shelf_space_ft": 1.5,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
            {
                "sku_code": "SNK-1022",
                "product_name": "Fritos Chili Cheese Corn Chips 9.25oz",
                "category": "Snacks",
                "weekly_sales": 760.00,
                "margin_pct": 29.0,
                "shelf_space_ft": 2.0,
                "status_badge": "MAINTAIN",
                "is_private_brand": False,
            },
        ]
        for sku_data in default_skus:
            sku_obj = SKUModel(
                id=str(uuid.uuid4()),
                sku_code=sku_data["sku_code"],
                product_name=sku_data["product_name"],
                category=sku_data["category"],
                weekly_sales=sku_data["weekly_sales"],
                margin_pct=sku_data["margin_pct"],
                shelf_space_ft=sku_data["shelf_space_ft"],
                status_badge=sku_data["status_badge"],
                is_private_brand=sku_data["is_private_brand"],
            )
            db.add(sku_obj)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

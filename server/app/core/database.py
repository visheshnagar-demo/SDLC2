import uuid
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
        if ":memory:" in DATABASE_URL or settings.TESTING
        else None,
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine=None):
    from app.models import cluster, sku, scenario, approval  # noqa: F401

    eng = target_engine or engine
    Base.metadata.create_all(bind=eng)


def seed_data(db: Session):
    from app.models.cluster import Cluster
    from app.models.sku import Sku
    from app.models.scenario import Scenario

    # Check if cluster already exists
    cluster_rec = (
        db.query(Cluster).filter(Cluster.cluster_code == "small_town_value").first()
    )
    if not cluster_rec:
        cluster_rec = Cluster(
            id=str(uuid.uuid4()),
            cluster_code="small_town_value",
            cluster_name="Small Town Value Cluster",
            description="Rural and small-town store cluster optimizing for value pricing, shelf density, and private brands.",
        )
        db.add(cluster_rec)
        db.flush()

    cluster_id = cluster_rec.id

    # Seed SKUs if not present
    existing_skus = db.query(Sku).filter(Sku.cluster_id == cluster_id).count()
    if existing_skus == 0:
        skus_to_seed = [
            # 5 GROW
            {
                "sku_code": "SKU-8842",
                "product_name": "Clover Valley Potato Chips 10oz",
                "sub_category": "Salty Snacks",
                "sales_velocity": 42.50,
                "sales_per_linear_ft": 210.40,
                "linear_ft_required": 4.0,
                "is_private_brand": True,
                "status_badge": "GROW",
                "instock_rate": 98.10,
            },
            {
                "sku_code": "SKU-8843",
                "product_name": "Clover Valley Tortilla Chips 13oz",
                "sub_category": "Salty Snacks",
                "sales_velocity": 38.00,
                "sales_per_linear_ft": 195.00,
                "linear_ft_required": 4.0,
                "is_private_brand": True,
                "status_badge": "GROW",
                "instock_rate": 97.50,
            },
            {
                "sku_code": "SKU-8844",
                "product_name": "Clover Valley Cheese Balls 16oz",
                "sub_category": "Extruded Snacks",
                "sales_velocity": 35.50,
                "sales_per_linear_ft": 188.00,
                "linear_ft_required": 3.5,
                "is_private_brand": True,
                "status_badge": "GROW",
                "instock_rate": 96.80,
            },
            {
                "sku_code": "SKU-8845",
                "product_name": "Clover Valley Trail Mix 8oz",
                "sub_category": "Nuts & Trail Mix",
                "sales_velocity": 31.20,
                "sales_per_linear_ft": 175.50,
                "linear_ft_required": 3.0,
                "is_private_brand": True,
                "status_badge": "GROW",
                "instock_rate": 98.00,
            },
            {
                "sku_code": "SKU-8846",
                "product_name": "Clover Valley Gummy Bears 7oz",
                "sub_category": "Candy & Sweets",
                "sales_velocity": 29.00,
                "sales_per_linear_ft": 168.00,
                "linear_ft_required": 2.5,
                "is_private_brand": True,
                "status_badge": "GROW",
                "instock_rate": 99.00,
            },
            # 12 MAINTAIN
            {
                "sku_code": "SKU-4109",
                "product_name": "National Brand Tortilla Chips 12oz",
                "sub_category": "Salty Snacks",
                "sales_velocity": 28.00,
                "sales_per_linear_ft": 160.20,
                "linear_ft_required": 4.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 96.40,
            },
            {
                "sku_code": "SKU-4110",
                "product_name": "Classic Salted Potato Chips 8oz",
                "sub_category": "Salty Snacks",
                "sales_velocity": 27.50,
                "sales_per_linear_ft": 158.00,
                "linear_ft_required": 4.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 96.00,
            },
            {
                "sku_code": "SKU-4111",
                "product_name": "Barbecue Crisp Potato Chips 8oz",
                "sub_category": "Salty Snacks",
                "sales_velocity": 26.00,
                "sales_per_linear_ft": 152.00,
                "linear_ft_required": 4.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 95.80,
            },
            {
                "sku_code": "SKU-4112",
                "product_name": "Sour Cream & Onion Crisps 8oz",
                "sub_category": "Salty Snacks",
                "sales_velocity": 25.20,
                "sales_per_linear_ft": 149.00,
                "linear_ft_required": 4.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 96.20,
            },
            {
                "sku_code": "SKU-4113",
                "product_name": "Cheddar Popcorn 6oz",
                "sub_category": "Popcorn",
                "sales_velocity": 24.00,
                "sales_per_linear_ft": 145.00,
                "linear_ft_required": 3.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 97.00,
            },
            {
                "sku_code": "SKU-4114",
                "product_name": "Buttered Microwave Popcorn 3ct",
                "sub_category": "Popcorn",
                "sales_velocity": 22.50,
                "sales_per_linear_ft": 140.00,
                "linear_ft_required": 3.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 96.50,
            },
            {
                "sku_code": "SKU-4115",
                "product_name": "Roasted Salted Peanuts 16oz",
                "sub_category": "Nuts & Trail Mix",
                "sales_velocity": 21.00,
                "sales_per_linear_ft": 138.00,
                "linear_ft_required": 3.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 97.20,
            },
            {
                "sku_code": "SKU-4116",
                "product_name": "Honey Roasted Cashews 8oz",
                "sub_category": "Nuts & Trail Mix",
                "sales_velocity": 20.50,
                "sales_per_linear_ft": 135.00,
                "linear_ft_required": 2.5,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 95.50,
            },
            {
                "sku_code": "SKU-4117",
                "product_name": "Sweet & Salty Granola Bars 6ct",
                "sub_category": "Snack Bars",
                "sales_velocity": 19.80,
                "sales_per_linear_ft": 132.00,
                "linear_ft_required": 3.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 96.80,
            },
            {
                "sku_code": "SKU-4118",
                "product_name": "Milk Chocolate Bar 4oz",
                "sub_category": "Candy & Sweets",
                "sales_velocity": 18.50,
                "sales_per_linear_ft": 128.00,
                "linear_ft_required": 2.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 98.50,
            },
            {
                "sku_code": "SKU-4119",
                "product_name": "Gummy Worms Sour 6oz",
                "sub_category": "Candy & Sweets",
                "sales_velocity": 17.00,
                "sales_per_linear_ft": 125.00,
                "linear_ft_required": 2.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 97.80,
            },
            {
                "sku_code": "SKU-4120",
                "product_name": "Beef Jerky Original 3.25oz",
                "sub_category": "Meat Snacks",
                "sales_velocity": 16.50,
                "sales_per_linear_ft": 122.00,
                "linear_ft_required": 2.0,
                "is_private_brand": False,
                "status_badge": "MAINTAIN",
                "instock_rate": 95.20,
            },
            # 3 SWAP
            {
                "sku_code": "SKU-3321",
                "product_name": "Regional Pretzel Twists 8oz",
                "sub_category": "Pretzels",
                "sales_velocity": 14.20,
                "sales_per_linear_ft": 115.00,
                "linear_ft_required": 3.0,
                "is_private_brand": False,
                "status_badge": "SWAP",
                "instock_rate": 94.00,
            },
            {
                "sku_code": "SKU-3322",
                "product_name": "Low-Sodium Multi-Grain Chips 7oz",
                "sub_category": "Salty Snacks",
                "sales_velocity": 13.00,
                "sales_per_linear_ft": 108.00,
                "linear_ft_required": 3.0,
                "is_private_brand": False,
                "status_badge": "SWAP",
                "instock_rate": 93.50,
            },
            {
                "sku_code": "SKU-3323",
                "product_name": "Spicy Jalapeno Sticks 4oz",
                "sub_category": "Extruded Snacks",
                "sales_velocity": 11.50,
                "sales_per_linear_ft": 98.00,
                "linear_ft_required": 2.5,
                "is_private_brand": False,
                "status_badge": "SWAP",
                "instock_rate": 92.80,
            },
            # 2 REDUCE
            {
                "sku_code": "SKU-1198",
                "product_name": "Slow-Moving Cheese Puffs 6oz",
                "sub_category": "Extruded Snacks",
                "sales_velocity": 8.10,
                "sales_per_linear_ft": 82.50,
                "linear_ft_required": 3.0,
                "is_private_brand": False,
                "status_badge": "REDUCE",
                "instock_rate": 91.50,
            },
            {
                "sku_code": "SKU-1199",
                "product_name": "Sugar-Free Licorice Bites 5oz",
                "sub_category": "Candy & Sweets",
                "sales_velocity": 6.40,
                "sales_per_linear_ft": 74.00,
                "linear_ft_required": 2.5,
                "is_private_brand": False,
                "status_badge": "REDUCE",
                "instock_rate": 90.00,
            },
        ]
        for item in skus_to_seed:
            s = Sku(id=str(uuid.uuid4()), cluster_id=cluster_id, **item)
            db.add(s)

    # Seed Scenarios if not present
    existing_scenarios = (
        db.query(Scenario).filter(Scenario.cluster_id == cluster_id).count()
    )
    if existing_scenarios == 0:
        scenarios_to_seed = [
            {
                "scenario_key": "conservative",
                "name": "Conservative Assortment Strategy",
                "description": "Low-risk optimization prioritizing existing supplier stability and minimal shelf reorganization.",
                "projected_sales_lift": 1.80,
                "projected_pb_share": 29.50,
                "projected_instock_rate": 98.00,
                "projected_shelf_capacity": 96.00,
                "is_default": False,
            },
            {
                "scenario_key": "balanced",
                "name": "Balanced Assortment Strategy",
                "description": "Optimized trade-off balancing revenue growth, private brand expansion, and strict shelf capacity constraints.",
                "projected_sales_lift": 4.50,
                "projected_pb_share": 32.50,
                "projected_instock_rate": 96.50,
                "projected_shelf_capacity": 99.00,
                "is_default": True,
            },
            {
                "scenario_key": "aggressive",
                "name": "Aggressive Assortment Strategy",
                "description": "High-growth margin strategy maximizing private brand expansion and replacing lower-velocity SKUs rapidly.",
                "projected_sales_lift": 7.80,
                "projected_pb_share": 36.00,
                "projected_instock_rate": 95.10,
                "projected_shelf_capacity": 100.00,
                "is_default": False,
            },
        ]
        for scen in scenarios_to_seed:
            sc = Scenario(id=str(uuid.uuid4()), cluster_id=cluster_id, **scen)
            db.add(sc)

    try:
        db.commit()
    except Exception:
        db.rollback()

import uuid
import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from server.models import Cluster, SKU, Scenario, User


def get_password_hash(password: str) -> str:
    # Use direct bcrypt hashing to avoid passlib wrap-bug detection incompatibilities
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def seed_data(db: Session):
    # 1. Seed Cluster
    cluster = db.query(Cluster).filter(Cluster.code == "STV-CLUSTER-04").first()
    if not cluster:
        cluster = Cluster(
            id=str(uuid.uuid4()),
            code="STV-CLUSTER-04",
            name="Small Town Value Cluster #04",
            category="Snacks",
            target_pb_pct=25.0,
            shelf_capacity_lin_ft=1250.0,
        )
        db.add(cluster)
        try:
            db.commit()
            db.refresh(cluster)
        except IntegrityError:
            db.rollback()
            cluster = db.query(Cluster).filter(Cluster.code == "STV-CLUSTER-04").first()

    cluster_id = cluster.id

    # 2. Seed Scenarios
    scenarios_data = [
        {
            "id": "conservative",
            "name": "Conservative",
            "description": "Minimize turnover risk and prioritize high-certainty stock stability.",
            "projected_sales_lift_pct": 1.8,
            "projected_private_brand_change_pct": 1.2,
            "projected_shelf_utilization_pct": 94.5,
            "actions_summary": {"grow": 2, "maintain": 16, "swap": 2, "reduce": 2},
            "is_default": False,
        },
        {
            "id": "balanced",
            "name": "Balanced",
            "description": "Optimally balances margin growth, PB expansion, and shelf capacity.",
            "projected_sales_lift_pct": 3.5,
            "projected_private_brand_change_pct": 3.0,
            "projected_shelf_utilization_pct": 96.0,
            "actions_summary": {"grow": 5, "maintain": 12, "swap": 3, "reduce": 2},
            "is_default": True,
        },
        {
            "id": "aggressive",
            "name": "Aggressive",
            "description": "Maximizes private brand share and aggressive SKU rationalization.",
            "projected_sales_lift_pct": 6.8,
            "projected_private_brand_change_pct": 6.5,
            "projected_shelf_utilization_pct": 99.2,
            "actions_summary": {"grow": 9, "maintain": 7, "swap": 4, "reduce": 2},
            "is_default": False,
        },
    ]

    for s_data in scenarios_data:
        existing_scenario = (
            db.query(Scenario).filter(Scenario.id == s_data["id"]).first()
        )
        if not existing_scenario:
            scenario = Scenario(
                id=s_data["id"],
                name=s_data["name"],
                description=s_data["description"],
                projected_sales_lift_pct=s_data["projected_sales_lift_pct"],
                projected_private_brand_change_pct=s_data[
                    "projected_private_brand_change_pct"
                ],
                projected_shelf_utilization_pct=s_data[
                    "projected_shelf_utilization_pct"
                ],
                actions_summary=s_data["actions_summary"],
                is_default=s_data["is_default"],
            )
            db.add(scenario)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()

    # 3. Seed SKUs (22 Snacks SKUs)
    skus_data = [
        {
            "sku_number": "84920",
            "name": "DG Guarantee Potato Chips 10oz",
            "brand": "DG Guarantee",
            "is_private_brand": True,
            "sales_amount": 14500.00,
            "sales_per_linear_foot": 182.50,
            "margin_percentage": 42.0,
            "velocity_units_per_week": 340,
            "shelf_space_linear_ft": 4.0,
            "status_badge": "GROW",
        },
        {
            "sku_number": "84921",
            "name": "Clover Valley Tortilla Chips 13oz",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales_amount": 12800.00,
            "sales_per_linear_foot": 165.00,
            "margin_percentage": 39.5,
            "velocity_units_per_week": 310,
            "shelf_space_linear_ft": 3.5,
            "status_badge": "GROW",
        },
        {
            "sku_number": "10482",
            "name": "Lay's Classic Potato Chips 8oz",
            "brand": "Lay's",
            "is_private_brand": False,
            "sales_amount": 18200.00,
            "sales_per_linear_foot": 195.00,
            "margin_percentage": 28.0,
            "velocity_units_per_week": 420,
            "shelf_space_linear_ft": 5.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "10483",
            "name": "Doritos Nacho Cheese 9.25oz",
            "brand": "Doritos",
            "is_private_brand": False,
            "sales_amount": 17400.00,
            "sales_per_linear_foot": 188.00,
            "margin_percentage": 29.0,
            "velocity_units_per_week": 390,
            "shelf_space_linear_ft": 5.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "84922",
            "name": "Clover Valley Cheese Puffs 8.5oz",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales_amount": 9400.00,
            "sales_per_linear_foot": 145.00,
            "margin_percentage": 44.0,
            "velocity_units_per_week": 260,
            "shelf_space_linear_ft": 3.0,
            "status_badge": "GROW",
        },
        {
            "sku_number": "10484",
            "name": "Cheetos Crunchy Cheese Snacks 8.5oz",
            "brand": "Cheetos",
            "is_private_brand": False,
            "sales_amount": 13900.00,
            "sales_per_linear_foot": 162.00,
            "margin_percentage": 30.5,
            "velocity_units_per_week": 320,
            "shelf_space_linear_ft": 4.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "33891",
            "name": "Regional BBQ Corn Chips 6oz",
            "brand": "ValueSnack",
            "is_private_brand": False,
            "sales_amount": 3200.00,
            "sales_per_linear_foot": 78.00,
            "margin_percentage": 22.0,
            "velocity_units_per_week": 95,
            "shelf_space_linear_ft": 2.5,
            "status_badge": "SWAP",
        },
        {
            "sku_number": "84923",
            "name": "DG Guarantee Sour Cream & Onion 10oz",
            "brand": "DG Guarantee",
            "is_private_brand": True,
            "sales_amount": 11200.00,
            "sales_per_linear_foot": 154.00,
            "margin_percentage": 41.5,
            "velocity_units_per_week": 280,
            "shelf_space_linear_ft": 3.5,
            "status_badge": "GROW",
        },
        {
            "sku_number": "10485",
            "name": "Pringles Original Crisps 5.2oz",
            "brand": "Pringles",
            "is_private_brand": False,
            "sales_amount": 10500.00,
            "sales_per_linear_foot": 148.00,
            "margin_percentage": 31.0,
            "velocity_units_per_week": 250,
            "shelf_space_linear_ft": 3.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "33892",
            "name": "Legacy Saltine Mini Crackers 7oz",
            "brand": "OldMill",
            "is_private_brand": False,
            "sales_amount": 2100.00,
            "sales_per_linear_foot": 52.00,
            "margin_percentage": 19.0,
            "velocity_units_per_week": 60,
            "shelf_space_linear_ft": 2.0,
            "status_badge": "REDUCE",
        },
        {
            "sku_number": "84924",
            "name": "Clover Valley Trail Mix Mountain 9oz",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales_amount": 10800.00,
            "sales_per_linear_foot": 172.00,
            "margin_percentage": 43.0,
            "velocity_units_per_week": 230,
            "shelf_space_linear_ft": 2.5,
            "status_badge": "GROW",
        },
        {
            "sku_number": "10486",
            "name": "Takis Fuego Hot Chili Pepper 9.9oz",
            "brand": "Takis",
            "is_private_brand": False,
            "sales_amount": 15100.00,
            "sales_per_linear_foot": 185.00,
            "margin_percentage": 32.0,
            "velocity_units_per_week": 330,
            "shelf_space_linear_ft": 4.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "33893",
            "name": "Generic Onion Rings 5oz",
            "brand": "CrispyBite",
            "is_private_brand": False,
            "sales_amount": 3400.00,
            "sales_per_linear_foot": 82.00,
            "margin_percentage": 24.0,
            "velocity_units_per_week": 110,
            "shelf_space_linear_ft": 2.5,
            "status_badge": "SWAP",
        },
        {
            "sku_number": "10487",
            "name": "Ritz Original Crackers 13.7oz",
            "brand": "Ritz",
            "is_private_brand": False,
            "sales_amount": 11900.00,
            "sales_per_linear_foot": 150.00,
            "margin_percentage": 29.5,
            "velocity_units_per_week": 270,
            "shelf_space_linear_ft": 3.5,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "10488",
            "name": "Oreo Chocolate Sandwich Cookies 14.3oz",
            "brand": "Oreo",
            "is_private_brand": False,
            "sales_amount": 16500.00,
            "sales_per_linear_foot": 190.00,
            "margin_percentage": 30.0,
            "velocity_units_per_week": 360,
            "shelf_space_linear_ft": 4.5,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "84925",
            "name": "Clover Valley Mini Sandwich Cookies 12oz",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales_amount": 8900.00,
            "sales_per_linear_foot": 138.00,
            "margin_percentage": 45.0,
            "velocity_units_per_week": 220,
            "shelf_space_linear_ft": 3.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "10489",
            "name": "Goldfish Cheddar Baked Crackers 6.6oz",
            "brand": "Goldfish",
            "is_private_brand": False,
            "sales_amount": 9200.00,
            "sales_per_linear_foot": 142.00,
            "margin_percentage": 28.5,
            "velocity_units_per_week": 240,
            "shelf_space_linear_ft": 3.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "33894",
            "name": "Standard Salt Pretzels 10oz",
            "brand": "SnackCo",
            "is_private_brand": False,
            "sales_amount": 2800.00,
            "sales_per_linear_foot": 68.00,
            "margin_percentage": 21.0,
            "velocity_units_per_week": 80,
            "shelf_space_linear_ft": 2.0,
            "status_badge": "SWAP",
        },
        {
            "sku_number": "33895",
            "name": "Unbranded Sesame Sticks 6oz",
            "brand": "TastyTreats",
            "is_private_brand": False,
            "sales_amount": 1900.00,
            "sales_per_linear_foot": 49.00,
            "margin_percentage": 18.0,
            "velocity_units_per_week": 50,
            "shelf_space_linear_ft": 2.0,
            "status_badge": "REDUCE",
        },
        {
            "sku_number": "10490",
            "name": "Planters Salted Peanuts 6oz",
            "brand": "Planters",
            "is_private_brand": False,
            "sales_amount": 8100.00,
            "sales_per_linear_foot": 135.00,
            "margin_percentage": 27.5,
            "velocity_units_per_week": 210,
            "shelf_space_linear_ft": 2.5,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "10491",
            "name": "Hostess CupCakes Chocolate 8ct",
            "brand": "Hostess",
            "is_private_brand": False,
            "sales_amount": 7600.00,
            "sales_per_linear_foot": 128.00,
            "margin_percentage": 26.0,
            "velocity_units_per_week": 190,
            "shelf_space_linear_ft": 3.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_number": "10492",
            "name": "Jack Link's Original Beef Jerky 2.85oz",
            "brand": "Jack Link's",
            "is_private_brand": False,
            "sales_amount": 12400.00,
            "sales_per_linear_foot": 178.00,
            "margin_percentage": 33.0,
            "velocity_units_per_week": 250,
            "shelf_space_linear_ft": 3.0,
            "status_badge": "MAINTAIN",
        },
    ]

    for sku_item in skus_data:
        existing_sku = (
            db.query(SKU).filter(SKU.sku_number == sku_item["sku_number"]).first()
        )
        if not existing_sku:
            sku = SKU(
                id=str(uuid.uuid4()),
                cluster_id=cluster_id,
                sku_number=sku_item["sku_number"],
                name=sku_item["name"],
                brand=sku_item["brand"],
                is_private_brand=sku_item["is_private_brand"],
                sales_amount=sku_item["sales_amount"],
                sales_per_linear_foot=sku_item["sales_per_linear_foot"],
                margin_percentage=sku_item["margin_percentage"],
                velocity_units_per_week=sku_item["velocity_units_per_week"],
                shelf_space_linear_ft=sku_item["shelf_space_linear_ft"],
                status_badge=sku_item["status_badge"],
            )
            db.add(sku)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()

    # 4. Seed Users (Constitution compliance)
    users_data = [
        {"email": "test@example.com", "password": "testpassword", "role": "user"},
        {"email": "admin@example.com", "password": "adminpassword", "role": "admin"},
    ]

    for u_item in users_data:
        existing_user = db.query(User).filter(User.email == u_item["email"]).first()
        if not existing_user:
            user = User(
                id=str(uuid.uuid4()),
                email=u_item["email"],
                hashed_password=get_password_hash(u_item["password"]),
                role=u_item["role"],
                is_active=True,
                is_verified=True,
            )
            db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()

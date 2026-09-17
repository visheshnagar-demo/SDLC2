import logging
from sqlalchemy.orm import Session
from server.models.cluster import ClusterModel
from server.models.sku import SnacksSkuModel
from server.models.scenario import ScenarioConfigModel
from server.models.guardrail import GuardrailPolicyModel

logger = logging.getLogger(__name__)


def seed_database(db: Session):
    # 1. Seed Clusters (both STV-CLUSTER and STV-01 for compatibility)
    clusters_to_seed = [
        {
            "cluster_code": "STV-CLUSTER",
            "name": "Small Town Value Cluster",
            "total_linear_feet": 120.0,
        },
        {
            "cluster_code": "STV-01",
            "name": "Small Town Value Cluster 01",
            "total_linear_feet": 120.0,
        },
    ]

    cluster_objs = {}
    for c_info in clusters_to_seed:
        c = (
            db.query(ClusterModel)
            .filter_by(cluster_code=c_info["cluster_code"])
            .first()
        )
        if not c:
            c = ClusterModel(**c_info)
            db.add(c)
            db.flush()
        cluster_objs[c_info["cluster_code"]] = c

    primary_cluster = cluster_objs["STV-CLUSTER"]

    # 2. Seed Scenarios
    scenarios_data = [
        {
            "code": "conservative",
            "name": "Conservative",
            "description": "Low-risk adjustments focusing on core top velocity items and supply chain stability.",
            "is_default": False,
            "projected_sales_delta_pct": 1.8,
            "projected_pb_share_pct": 0.5,
            "projected_in_stock_pct": 1.2,
            "projected_capacity_pct": -2.0,
        },
        {
            "code": "balanced",
            "name": "Balanced",
            "description": "Optimal mix of margin growth, private brand expansion, and high shelf turnover.",
            "is_default": True,
            "projected_sales_delta_pct": 4.2,
            "projected_pb_share_pct": 2.1,
            "projected_in_stock_pct": 0.4,
            "projected_capacity_pct": 1.5,
        },
        {
            "code": "aggressive",
            "name": "Aggressive",
            "description": "High-growth strategy introducing margin-accretive private brands and radical SKU rationalization.",
            "is_default": False,
            "projected_sales_delta_pct": 8.5,
            "projected_pb_share_pct": 4.5,
            "projected_in_stock_pct": -1.0,
            "projected_capacity_pct": 6.0,
        },
    ]

    for s_data in scenarios_data:
        existing = db.query(ScenarioConfigModel).filter_by(code=s_data["code"]).first()
        if not existing:
            sc = ScenarioConfigModel(**s_data)
            db.add(sc)
            db.flush()

    # 3. Seed Guardrails
    guardrails_data = [
        {
            "rule_key": "min_margin",
            "rule_name": "Gross Margin >= 28%",
            "threshold_value": 28.0,
            "comparison_operator": ">=",
            "status": "ACTIVE",
        },
        {
            "rule_key": "min_pb_share",
            "rule_name": "Private Brand Share >= 30%",
            "threshold_value": 30.0,
            "comparison_operator": ">=",
            "status": "ACTIVE",
        },
        {
            "rule_key": "max_shelf_capacity",
            "rule_name": "Shelf Space Utilization <= 100%",
            "threshold_value": 100.0,
            "comparison_operator": "<=",
            "status": "ACTIVE",
        },
        {
            "rule_key": "min_in_stock",
            "rule_name": "In-Stock Rate >= 95%",
            "threshold_value": 95.0,
            "comparison_operator": ">=",
            "status": "ACTIVE",
        },
    ]

    for g_data in guardrails_data:
        existing = (
            db.query(GuardrailPolicyModel)
            .filter_by(rule_key=g_data["rule_key"])
            .first()
        )
        if not existing:
            gp = GuardrailPolicyModel(**g_data)
            db.add(gp)
            db.flush()

    # 4. Seed Snacks SKUs with realistic healthy category margins
    skus_data = [
        {
            "sku_code": "SKU-SNK-001",
            "name": "Clover Valley Potato Chips 10oz",
            "subcategory": "Salty Snacks",
            "brand_tier": "Private Brand",
            "sales_per_lin_ft": 185.20,
            "margin_pct": 38.5,
            "weekly_unit_velocity": 48.0,
            "in_stock_pct": 98.2,
            "shelf_linear_ft": 4.0,
            "status_badge": "GROW",
        },
        {
            "sku_code": "SKU-SNK-002",
            "name": "Clover Valley Tortilla Chips 13oz",
            "subcategory": "Salty Snacks",
            "brand_tier": "Private Brand",
            "sales_per_lin_ft": 162.40,
            "margin_pct": 36.0,
            "weekly_unit_velocity": 42.0,
            "in_stock_pct": 97.5,
            "shelf_linear_ft": 3.5,
            "status_badge": "GROW",
        },
        {
            "sku_code": "SKU-SNK-003",
            "name": "Clover Valley Chocolate Chip Cookies 13oz",
            "subcategory": "Cookies & Crackers",
            "brand_tier": "Private Brand",
            "sales_per_lin_ft": 145.80,
            "margin_pct": 40.2,
            "weekly_unit_velocity": 36.5,
            "in_stock_pct": 96.0,
            "shelf_linear_ft": 3.0,
            "status_badge": "GROW",
        },
        {
            "sku_code": "SKU-SNK-004",
            "name": "Clover Valley Beef Jerky Original 3oz",
            "subcategory": "Meat Snacks",
            "brand_tier": "Private Brand",
            "sales_per_lin_ft": 155.00,
            "margin_pct": 37.0,
            "weekly_unit_velocity": 28.0,
            "in_stock_pct": 95.8,
            "shelf_linear_ft": 2.5,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-005",
            "name": "Clover Valley Roasted Peanuts 16oz",
            "subcategory": "Nuts & Seeds",
            "brand_tier": "Private Brand",
            "sales_per_lin_ft": 128.50,
            "margin_pct": 35.5,
            "weekly_unit_velocity": 24.0,
            "in_stock_pct": 99.0,
            "shelf_linear_ft": 2.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-006",
            "name": "Clover Valley Gummy Bears 8oz",
            "subcategory": "Candy & Sweet",
            "brand_tier": "Private Brand",
            "sales_per_lin_ft": 140.00,
            "margin_pct": 41.0,
            "weekly_unit_velocity": 32.0,
            "in_stock_pct": 96.5,
            "shelf_linear_ft": 2.0,
            "status_badge": "GROW",
        },
        {
            "sku_code": "SKU-SNK-007",
            "name": "Lay's Classic Potato Chips 8oz",
            "subcategory": "Salty Snacks",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 210.00,
            "margin_pct": 30.5,
            "weekly_unit_velocity": 65.0,
            "in_stock_pct": 97.0,
            "shelf_linear_ft": 6.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-008",
            "name": "Doritos Nacho Cheese 9.25oz",
            "subcategory": "Salty Snacks",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 198.50,
            "margin_pct": 31.0,
            "weekly_unit_velocity": 58.0,
            "in_stock_pct": 96.8,
            "shelf_linear_ft": 5.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-009",
            "name": "Cheetos Crunchy 8.5oz",
            "subcategory": "Salty Snacks",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 172.00,
            "margin_pct": 30.5,
            "weekly_unit_velocity": 45.0,
            "in_stock_pct": 95.5,
            "shelf_linear_ft": 4.5,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-010",
            "name": "Oreo Original Cookies 14.3oz",
            "subcategory": "Cookies & Crackers",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 165.00,
            "margin_pct": 31.0,
            "weekly_unit_velocity": 40.0,
            "in_stock_pct": 98.0,
            "shelf_linear_ft": 4.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-011",
            "name": "Cheez-It Original Crackers 12.4oz",
            "subcategory": "Cookies & Crackers",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 150.00,
            "margin_pct": 30.5,
            "weekly_unit_velocity": 38.0,
            "in_stock_pct": 97.2,
            "shelf_linear_ft": 3.5,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-012",
            "name": "Jack Link's Original Beef Jerky 3.25oz",
            "subcategory": "Meat Snacks",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 175.00,
            "margin_pct": 29.0,
            "weekly_unit_velocity": 30.0,
            "in_stock_pct": 95.5,
            "shelf_linear_ft": 3.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-013",
            "name": "Slim Jim Giant Smoked Snack Stick 0.97oz",
            "subcategory": "Meat Snacks",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 135.00,
            "margin_pct": 33.0,
            "weekly_unit_velocity": 52.0,
            "in_stock_pct": 98.5,
            "shelf_linear_ft": 2.0,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-014",
            "name": "M&M's Milk Chocolate Sharing Size 10.7oz",
            "subcategory": "Candy & Sweet",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 142.00,
            "margin_pct": 29.5,
            "weekly_unit_velocity": 34.0,
            "in_stock_pct": 96.0,
            "shelf_linear_ft": 2.5,
            "status_badge": "MAINTAIN",
        },
        {
            "sku_code": "SKU-SNK-015",
            "name": "Brand X Pretzel Twists 16oz",
            "subcategory": "Salty Snacks",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 65.00,
            "margin_pct": 28.0,
            "weekly_unit_velocity": 12.0,
            "in_stock_pct": 95.0,
            "shelf_linear_ft": 3.0,
            "status_badge": "SWAP",
        },
        {
            "sku_code": "SKU-SNK-016",
            "name": "Brand Y Cheese Puffs 8oz",
            "subcategory": "Salty Snacks",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 58.00,
            "margin_pct": 28.5,
            "weekly_unit_velocity": 11.0,
            "in_stock_pct": 95.0,
            "shelf_linear_ft": 3.0,
            "status_badge": "SWAP",
        },
        {
            "sku_code": "SKU-SNK-017",
            "name": "Slow-Moving Hard Candy Assortment 12oz",
            "subcategory": "Candy & Sweet",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 42.00,
            "margin_pct": 28.0,
            "weekly_unit_velocity": 8.0,
            "in_stock_pct": 95.0,
            "shelf_linear_ft": 2.5,
            "status_badge": "REDUCE",
        },
        {
            "sku_code": "SKU-SNK-018",
            "name": "Low-Margin Trail Mix Tub 24oz",
            "subcategory": "Nuts & Seeds",
            "brand_tier": "National Brand",
            "sales_per_lin_ft": 48.00,
            "margin_pct": 28.0,
            "weekly_unit_velocity": 7.5,
            "in_stock_pct": 95.0,
            "shelf_linear_ft": 3.0,
            "status_badge": "REDUCE",
        },
    ]

    for cluster in [primary_cluster, cluster_objs.get("STV-01")]:
        if not cluster:
            continue
        for sku_item in skus_data:
            sku_code_cluster = f"{sku_item['sku_code']}-{cluster.cluster_code}"
            existing = (
                db.query(SnacksSkuModel).filter_by(sku_code=sku_code_cluster).first()
            )
            if not existing:
                sku_obj = SnacksSkuModel(
                    cluster_id=cluster.id,
                    sku_code=sku_code_cluster,
                    name=sku_item["name"],
                    subcategory=sku_item["subcategory"],
                    brand_tier=sku_item["brand_tier"],
                    sales_per_lin_ft=sku_item["sales_per_lin_ft"],
                    margin_pct=sku_item["margin_pct"],
                    weekly_unit_velocity=sku_item["weekly_unit_velocity"],
                    in_stock_pct=sku_item["in_stock_pct"],
                    shelf_linear_ft=sku_item["shelf_linear_ft"],
                    status_badge=sku_item["status_badge"],
                )
                db.add(sku_obj)
                db.flush()

    db.commit()


# Alias for backward compatibility
seed_data = seed_database

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.models.sku import SnacksSkuModel
from server.models.cluster import ClusterModel
from server.schemas.sku import SkuListResponse, SkuResponse, SkuCreate, SkuUpdate


class SkuService:
    @staticmethod
    def get_skus(
        db: Session,
        search: Optional[str] = None,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        status_badge: Optional[str] = None,
        brand_tier: Optional[str] = None,
        cluster_code: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> SkuListResponse:
        query = db.query(SnacksSkuModel)

        if cluster_code:
            cluster = (
                db.query(ClusterModel).filter_by(cluster_code=cluster_code).first()
            )
            if cluster:
                query = query.filter(SnacksSkuModel.cluster_id == cluster.id)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    SnacksSkuModel.name.ilike(search_pattern),
                    SnacksSkuModel.sku_code.ilike(search_pattern),
                    SnacksSkuModel.subcategory.ilike(search_pattern),
                )
            )

        if subcategory and subcategory != "All":
            query = query.filter(SnacksSkuModel.subcategory == subcategory)

        if status_badge and status_badge != "All":
            query = query.filter(SnacksSkuModel.status_badge == status_badge)

        if brand_tier and brand_tier != "All":
            query = query.filter(SnacksSkuModel.brand_tier == brand_tier)

        total = query.count()
        items = query.offset(skip).limit(limit).all()

        return SkuListResponse(
            items=[SkuResponse.model_validate(item) for item in items],
            total=total,
            skip=skip,
            limit=limit,
        )

    @staticmethod
    def get_sku_by_id(db: Session, sku_id: str) -> Optional[SnacksSkuModel]:
        return (
            db.query(SnacksSkuModel)
            .filter(or_(SnacksSkuModel.id == sku_id, SnacksSkuModel.sku_code == sku_id))
            .first()
        )

    @staticmethod
    def create_sku(db: Session, sku_in: SkuCreate) -> SnacksSkuModel:
        if not sku_in.cluster_id:
            cluster = db.query(ClusterModel).first()
            cluster_id = cluster.id if cluster else "cluster-1"
        else:
            cluster_id = sku_in.cluster_id

        sku_data = sku_in.model_dump(exclude={"cluster_id"})
        sku_obj = SnacksSkuModel(cluster_id=cluster_id, **sku_data)
        db.add(sku_obj)
        db.commit()
        db.refresh(sku_obj)
        return sku_obj

    @staticmethod
    def update_sku(
        db: Session, sku_id: str, sku_in: SkuUpdate
    ) -> Optional[SnacksSkuModel]:
        sku_obj = SkuService.get_sku_by_id(db, sku_id)
        if not sku_obj:
            return None

        update_data = sku_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(sku_obj, key, value)

        db.commit()
        db.refresh(sku_obj)
        return sku_obj

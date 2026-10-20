from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.scoring_config import ScoringRuleConfig
from server.schemas.config import ScoringRuleConfigResponse, ScoringRuleConfigUpdate
from server.dependencies.auth import get_current_user, require_roles
from server.models.user import User

router = APIRouter(prefix="/api/v1/config", tags=["Configuration"])


@router.get("/scoring-rules", response_model=List[ScoringRuleConfigResponse])
def get_all_scoring_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(ScoringRuleConfig).all()


@router.get("/scoring-rules/{lob}", response_model=ScoringRuleConfigResponse)
def get_scoring_rule_by_lob(
    lob: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    normalized = lob.upper()
    rule = (
        db.query(ScoringRuleConfig)
        .filter(ScoringRuleConfig.line_of_business == normalized)
        .first()
    )
    if not rule:
        raise HTTPException(
            status_code=404, detail=f"Scoring rule config for {lob} not found"
        )
    return rule


@router.put("/scoring-rules/{lob}", response_model=ScoringRuleConfigResponse)
def update_scoring_rule(
    lob: str,
    update_in: ScoringRuleConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["UNDERWRITING_MANAGER"])),
):
    normalized = lob.upper()
    rule = (
        db.query(ScoringRuleConfig)
        .filter(ScoringRuleConfig.line_of_business == normalized)
        .first()
    )
    if not rule:
        raise HTTPException(
            status_code=404, detail=f"Scoring rule config for {lob} not found"
        )

    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(rule, field, val)

    db.commit()
    db.refresh(rule)
    return rule

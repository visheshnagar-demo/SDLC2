from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import UnderwritingAuthority
from server.schemas import AuthorityLimitSchema

router = APIRouter(prefix="/api/v1/config", tags=["Configuration"])


@router.get("/scoring-rules")
def handle_get_scoring_rules() -> dict[str, Any]:
    return {
        "cyberWeights": {
            "mfa": 20,
            "edr": 15,
            "backups": 15,
            "lossHistory": 30,
            "training": 20,
        },
        "doWeights": {
            "financialStrength": 30,
            "claimsHistory": 35,
            "boardGovernance": 20,
            "regulatoryExposure": 15,
        },
        "generalWeights": {
            "lossExperience": 40,
            "industryTenure": 30,
            "riskProtocols": 30,
        },
    }


@router.get("/authorities", response_model=list[AuthorityLimitSchema])
def handle_get_authorities(db: Session = Depends(get_db)):
    auths = db.query(UnderwritingAuthority).all()
    if not auths:
        return [
            AuthorityLimitSchema(
                id="default-uw", roleName="UNDERWRITER", maxPolicyLimit=5000000.00
            ),
            AuthorityLimitSchema(
                id="default-mgr", roleName="MANAGER", maxPolicyLimit=25000000.00
            ),
        ]
    return [
        AuthorityLimitSchema(
            id=a.id, roleName=a.role_name, maxPolicyLimit=a.max_policy_limit
        )
        for a in auths
    ]

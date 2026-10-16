from fastapi import APIRouter, status
from server.schemas import RiskScoreRequest, RiskScoreResponse
from server.services.scoring_service import RiskScoringService

router = APIRouter(prefix="/api/v1/underwriting/score", tags=["Risk Scoring"])


@router.post(
    "",
    response_model=RiskScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate or preview risk score for Cyber / D&O submission parameters",
)
def calculate_risk_score(payload: RiskScoreRequest):
    return RiskScoringService.calculate_risk_score(
        risk_category=payload.risk_category,
        policy_limit_usd=payload.policy_limit_usd,
        attachment_point_usd=payload.attachment_point_usd,
        carrier_rating=payload.carrier_rating,
        industry_sector=payload.industry_sector,
        prior_loss_amount_usd=payload.prior_loss_amount_usd,
    )

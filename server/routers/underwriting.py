from typing import List
from fastapi import APIRouter
from server.schemas.decision import DeclineReason
from server.services.decision_service import get_decline_reasons

router = APIRouter(prefix="/api/v1/underwriting", tags=["Underwriting"])


@router.get("/reasons", response_model=List[DeclineReason])
def list_decline_reasons():
    reasons = get_decline_reasons()
    return reasons

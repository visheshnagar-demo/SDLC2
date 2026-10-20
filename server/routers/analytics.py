from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.analytics import ManagerDashboardDTO
from server.services.analytics_service import get_manager_dashboard_analytics
from server.dependencies.auth import require_roles
from server.models.user import User

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/manager-dashboard", response_model=ManagerDashboardDTO)
def get_manager_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["UNDERWRITING_MANAGER", "RE_UNDERWRITER"])
    ),
):
    return get_manager_dashboard_analytics(db)

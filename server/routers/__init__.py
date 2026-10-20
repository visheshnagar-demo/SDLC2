from server.routers.auth import router as auth_router
from server.routers.submissions import router as submissions_router
from server.routers.scoring import router as scoring_router
from server.routers.decisions import router as decisions_router
from server.routers.quotes import router as quotes_router
from server.routers.analytics import router as analytics_router
from server.routers.config import router as config_router
from server.routers.audit import router as audit_router

__all__ = [
    "auth_router",
    "submissions_router",
    "scoring_router",
    "decisions_router",
    "quotes_router",
    "analytics_router",
    "config_router",
    "audit_router",
]

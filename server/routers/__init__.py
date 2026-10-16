from server.routers.submissions import router as submissions_router
from server.routers.underwriting import router as underwriting_router
from server.routers.decisions import router as decisions_router

__all__ = [
    "submissions_router",
    "underwriting_router",
    "decisions_router",
]

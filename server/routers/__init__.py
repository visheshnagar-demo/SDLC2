from server.routers.auth_router import router as auth_router
from server.routers.submission_router import router as submission_router
from server.routers.underwriting_router import router as underwriting_router

__all__ = [
    "auth_router",
    "submission_router",
    "underwriting_router",
]

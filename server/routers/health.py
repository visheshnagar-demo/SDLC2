from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
@router.get("/api/v1/health")
def health_check() -> dict:
    """System health check endpoint."""
    return {
        "status": "UP",
        "service": "genre-qtb-backend",
        "version": "1.0.0",
        "timestamp": "2026-10-20T00:00:00Z",
    }

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "motor-insurance-premium-calculator",
        "version": "1.0.0"
    }

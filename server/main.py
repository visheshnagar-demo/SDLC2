from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from server.config import settings
from server.database import SessionLocal, init_db, seed_data
from server.routers.auth_router import router as auth_router
from server.routers.submission_router import router as submission_router
from server.routers.underwriting_router import router as underwriting_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized and seeded
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Facultative Reinsurance Web Portal API for Cyber and D&O Risk Placements",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler for standardized error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if hasattr(exc, "status_code") and hasattr(exc, "detail"):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


@app.get("/healthz", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": "1.0.0"}


# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(submission_router, prefix=settings.API_V1_STR)
app.include_router(underwriting_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)

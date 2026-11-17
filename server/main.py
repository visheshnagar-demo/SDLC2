from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.config import ALLOWED_ORIGINS
from server.database import init_db, seed_data, SessionLocal
from server.routers import (
    auth as auth_router,
    documents as documents_router,
    biometrics as biometrics_router,
    compliance as compliance_router,
    admin as admin_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed test users
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Digital Identity Verification Platform API",
    description="End-to-end digital identity verification platform supporting customer registration, document OCR extraction, biometric checks, compliance review portal, and admin audit logging.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(documents_router.router)
app.include_router(biometrics_router.router)
app.include_router(compliance_router.router)
app.include_router(admin_router.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "digital-identity-verification",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)

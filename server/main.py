from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.config import ALLOWED_ORIGINS
from server.database import init_db
from server.routers import auth_router, submission_router, underwriting_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and test seed accounts are created idempotently
    init_db()
    yield


app = FastAPI(
    title="Facultative Reinsurance Web Portal API",
    description="API for Carrier Facultative Reinsurance Submissions and Underwriter Scoring & Review Queue",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware for fullstack integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(submission_router)
app.include_router(underwriting_router)


@app.get("/")
def root():
    return {
        "message": "Facultative Reinsurance Portal API",
        "docs_url": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "facultative-reinsurance-backend"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)

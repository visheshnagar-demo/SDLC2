import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data
from server.routers import submissions, underwriting, decisions


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_data()
    yield


app = FastAPI(
    title="Facultative Reinsurance Intake Portal & Underwriter Queue API",
    version="1.0.0",
    description="API for Carrier Submission Intake, Automated Risk Scoring, Missing Info Flagging, and Underwriting Decisions for Cyber & D&O Risks",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions.router)
app.include_router(underwriting.router)
app.include_router(decisions.router)


@app.get("/")
@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "facultative-reinsurance-portal",
        "version": "1.0.0",
    }

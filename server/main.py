import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data
from server.routers import auth, accounts, transfers


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_data()
    yield


app = FastAPI(
    title="Banking Platform API",
    version="1.0.0",
    description="REST API for Authentication, Account Management, and Atomic Fund Transfers",
    lifespan=lifespan,
)

# CORS configuration
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

# Register routers
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(transfers.router)


@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "Banking Platform"}


@app.get("/")
def root():
    return {"message": "Welcome to Banking Platform API", "docs": "/docs"}

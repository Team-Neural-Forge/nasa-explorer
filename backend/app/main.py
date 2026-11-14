import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import nasa

app = FastAPI(title="NASA Explorer API", version="0.1.0")

cors_origins = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nasa.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

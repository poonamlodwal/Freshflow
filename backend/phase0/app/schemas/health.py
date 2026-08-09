"""
schemas/health.py — Pydantic models for GET /health.
"""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str                  # "ok" | "degraded"
    model_loaded: bool
    model_id: str
    uptime_seconds: float
    env: str

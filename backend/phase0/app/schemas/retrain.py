"""
schemas/retrain.py — Pydantic models for POST /retrain.
Matches the API contract in architecture.md §4.2 exactly.
"""

from pydantic import BaseModel, Field


class RetrainRequest(BaseModel):
    sampleLimit: int = Field(default=200, ge=1, le=5000)  # noqa: N815


class RetrainResponse(BaseModel):
    status: str            # "completed" | "skipped" | "error"
    samplesUsed: int       # noqa: N815
    accuracyBefore: float  # noqa: N815
    accuracyAfter: float   # noqa: N815
    message: str = ""

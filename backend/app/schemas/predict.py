"""
schemas/predict.py — Pydantic models for POST /predict.
Matches the API contract in architecture.md §4.1 exactly.
"""

from pydantic import BaseModel, HttpUrl, field_validator


class PredictRequest(BaseModel):
    imageUrl: HttpUrl  # noqa: N815  (keep camelCase to match frontend contract)

    @field_validator("imageUrl", mode="before")
    @classmethod
    def must_be_http(cls, v: str) -> str:
        if not str(v).startswith(("http://", "https://")):
            raise ValueError("imageUrl must be an http/https URL")
        return v


class PredictResponse(BaseModel):
    produceType: str            # e.g. "banana"  noqa: N815
    freshStatus: str            # "fresh" | "rotten"  noqa: N815
    confidence: float           # 0.0 – 1.0
    estimatedShelfLifeDays: int  # noqa: N815

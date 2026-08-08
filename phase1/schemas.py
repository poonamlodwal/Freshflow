"""
schemas.py
----------
All Pydantic v2 request and response models for the FreshChain ML service.
These are the canonical API contracts — update here when the API changes.
"""

from pydantic import BaseModel, HttpUrl, Field


# ── Requests ──────────────────────────────────────────────────────────────────

class PredictURLRequest(BaseModel):
    """Body for POST /predict/url — Next.js sends this after uploading to storage."""
    imageUrl: HttpUrl = Field(
        ...,
        description="Publicly accessible URL of the produce image (Supabase/Cloudinary).",
        examples=["https://storage.example.com/batches/banana_001.jpg"],
    )


# ── Responses ─────────────────────────────────────────────────────────────────

class PredictResponse(BaseModel):
    """
    Prediction result returned by both /predict/url and /predict/upload.
    Maps to the Batch fields in the Prisma schema.
    """
    produceType: str = Field(
        ...,
        description="Detected fruit/vegetable type (e.g. 'banana', 'apple').",
    )
    freshStatus: str = Field(
        ...,
        description="'fresh' | 'rotten' — the quality classification.",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model confidence score [0, 1].",
    )
    estimatedShelfLifeDays: int = Field(
        ...,
        ge=0,
        description="Rule-based shelf-life estimate in days.",
    )
    isNearExpiry: bool = Field(
        ...,
        description="True when estimatedShelfLifeDays <= NEAR_EXPIRY_THRESHOLD.",
    )
    modelId: str = Field(
        ...,
        description="Hugging Face model ID used for this prediction (for attribution).",
    )
    rawLabel: str = Field(
        ...,
        description="Raw label string returned by the HF model (for debugging).",
    )


class HealthResponse(BaseModel):
    """Response for GET /health."""
    status: str = Field(..., examples=["ok"])
    modelLoaded: bool
    modelId: str

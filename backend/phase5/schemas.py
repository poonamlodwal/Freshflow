"""
schemas.py
----------
Pydantic v2 schemas for Phase 5 Fine-Tuning Loop & backend endpoints.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl

from models_db import ClaimStatusEnum, ListingStatusEnum, RoleEnum, StatusEventTypeEnum


# ── Prediction & Health Schemas ───────────────────────────────────────────────

class PredictURLRequest(BaseModel):
    imageUrl: HttpUrl = Field(..., description="Publicly accessible URL of produce image.")


class PredictResponse(BaseModel):
    produceType: str
    freshStatus: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    estimatedShelfLifeDays: int = Field(..., ge=0)
    isNearExpiry: bool
    modelId: str
    rawLabel: str
    sampleId: Optional[str] = Field(None, description="ID of created TrainingSample")


class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool
    modelId: str
    phase: str = "Phase 5 — Fine-Tuning Loop"


# ── Phase 5 Fine-Tuning Schemas ───────────────────────────────────────────────

class TrainingSampleResponse(BaseModel):
    id: str
    batchId: Optional[str] = None
    imageUrl: str
    predictedLabel: str
    correctedLabel: Optional[str] = None
    usedInRetrain: bool
    createdAt: datetime

    class Config:
        from_attributes = True


class CorrectSampleRequest(BaseModel):
    correctedLabel: str = Field(..., description="Correct label provided by user (e.g. 'freshapple' or 'rottenapple').")


class RetrainRequest(BaseModel):
    sampleLimit: Optional[int] = Field(100, ge=1, description="Max training samples to include in retrain batch.")


class RetrainResponse(BaseModel):
    status: str
    samplesUsed: int
    accuracyBefore: float
    accuracyAfter: float
    retrainHistoryId: str
    message: str


class RetrainHistoryResponse(BaseModel):
    id: str
    samplesUsed: int
    accuracyBefore: float
    accuracyAfter: float
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True


class AdminRetrainSummaryResponse(BaseModel):
    headline: str = Field(..., description="Admin dashboard deliverable string: Model retrained on X new samples — accuracy improved from Y% to Z%.")
    totalSamplesLogged: int
    samplesRetrained: int
    pendingUnretrainedSamples: int
    latestRetrain: Optional[RetrainHistoryResponse] = None


# ── Core Domain Schemas (Users, Batches, Listings, Claims, ERP) ────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    role: RoleEnum = RoleEnum.BUSINESS
    location: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: RoleEnum
    location: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True


class BatchCreate(BaseModel):
    ownerId: str
    produceType: str
    imageUrl: str
    freshStatus: str
    confidence: float
    estimatedShelfLifeDays: int
    qrCodeUrl: Optional[str] = None


class BatchResponse(BaseModel):
    id: str
    ownerId: str
    produceType: str
    imageUrl: str
    freshStatus: str
    confidence: float
    estimatedShelfLifeDays: int
    isNearExpiry: bool
    qrCodeUrl: Optional[str] = None
    createdAt: datetime


class ListingCreate(BaseModel):
    batchId: str
    price: Optional[float] = None
    quantity: int = 1
    expiryWindow: datetime


class ListingFilter(BaseModel):
    produceType: Optional[str] = None
    location: Optional[str] = None
    maxPrice: Optional[float] = None
    status: Optional[ListingStatusEnum] = ListingStatusEnum.AVAILABLE
    isNearExpiryOnly: Optional[bool] = False


class ListingResponse(BaseModel):
    id: str
    batchId: str
    price: Optional[float] = None
    quantity: int
    status: ListingStatusEnum
    expiryWindow: datetime
    createdAt: datetime
    batch: BatchResponse


class ClaimCreate(BaseModel):
    buyerId: str


class ClaimRespondRequest(BaseModel):
    accept: bool


class ClaimResponse(BaseModel):
    id: str
    listingId: str
    buyerId: str
    status: ClaimStatusEnum
    requestedAt: datetime


class StatusEventResponse(BaseModel):
    id: str
    batchId: str
    eventType: StatusEventTypeEnum
    notes: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class ERPStatsResponse(BaseModel):
    totalBatchesScanned: int
    freshPercentage: float
    rottenPercentage: float
    claimedListingsCount: int
    expiredListingsCount: int
    totalRevenue: float
    estimatedWasteSavedKg: float


class InventoryItemResponse(BaseModel):
    batchId: str
    produceType: str
    imageUrl: str
    freshStatus: str
    confidence: float
    estimatedShelfLifeDays: int
    isNearExpiry: bool
    qrCodeUrl: Optional[str] = None
    scannedAt: datetime
    listingId: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    listingStatus: str


class AISuggestionResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    actionLabel: str
    batchId: Optional[str] = None
    listingId: Optional[str] = None


class ProduceBreakdown(BaseModel):
    produceType: str
    freshCount: int
    rottenCount: int
    total: int


class DailyScanPoint(BaseModel):
    date: str
    scansCount: int
    freshCount: int
    rottenCount: int


class AnalyticsChartDataResponse(BaseModel):
    produceBreakdown: List[ProduceBreakdown]
    dailyScanTrend: List[DailyScanPoint]
    claimStatusBreakdown: dict[str, int]

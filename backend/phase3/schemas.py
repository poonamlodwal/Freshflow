"""
schemas.py
----------
Pydantic v2 Schemas for Phase 3 API request and response contracts,
including public QR Traceability payloads.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from models_db import ClaimStatusEnum, ListingStatusEnum, RoleEnum, StatusEventTypeEnum


# ── User Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., example="Fresh Farm Co")
    email: EmailStr = Field(..., example="contact@freshfarm.com")
    role: RoleEnum = Field(default=RoleEnum.BUSINESS)
    location: Optional[str] = Field(default=None, example="California, USA")


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: RoleEnum
    location: Optional[str] = None
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Status Event & Traceability Schemas ───────────────────────────────────────

class StatusEventResponse(BaseModel):
    id: str
    batchId: str
    eventType: StatusEventTypeEnum
    notes: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class OriginInfo(BaseModel):
    ownerId: str
    ownerName: str
    location: Optional[str] = None
    email: str


class QualityResult(BaseModel):
    freshStatus: str
    confidence: float
    estimatedShelfLifeDays: int


class TimelineEvent(BaseModel):
    id: str
    eventType: StatusEventTypeEnum
    timestamp: datetime
    title: str
    description: str


class PublicBatchTraceResponse(BaseModel):
    batchId: str
    produceType: str
    imageUrl: str
    qrCodeUrl: Optional[str] = None
    trackUrl: str
    createdAt: datetime
    currentStatus: str
    origin: OriginInfo
    qualityResult: QualityResult
    timeline: List[TimelineEvent]

    model_config = ConfigDict(from_attributes=True)


# ── Batch Schemas ─────────────────────────────────────────────────────────────

class BatchCreate(BaseModel):
    ownerId: str
    produceType: str = Field(..., example="banana")
    imageUrl: str = Field(..., example="https://storage.com/produce.jpg")
    freshStatus: str = Field(..., example="fresh")
    confidence: float = Field(..., ge=0.0, le=1.0)
    estimatedShelfLifeDays: int = Field(..., ge=0)
    qrCodeUrl: Optional[str] = None


class BatchResponse(BaseModel):
    id: str
    ownerId: str
    produceType: str
    imageUrl: str
    freshStatus: str
    confidence: float
    estimatedShelfLifeDays: int
    qrCodeUrl: Optional[str] = None
    trackUrl: str
    isNearExpiry: bool
    suggestListing: bool
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Listing Schemas ───────────────────────────────────────────────────────────

class ListingCreate(BaseModel):
    batchId: str
    price: Optional[float] = Field(default=None, ge=0.0, example=2.50)
    quantity: int = Field(default=1, ge=1)
    expiryWindow: datetime = Field(..., description="Timestamp when produce expires")


class ListingResponse(BaseModel):
    id: str
    batchId: str
    price: Optional[float] = None
    quantity: int
    status: ListingStatusEnum
    expiryWindow: datetime
    createdAt: datetime
    batch: BatchResponse

    model_config = ConfigDict(from_attributes=True)


class ListingFilter(BaseModel):
    produceType: Optional[str] = None
    location: Optional[str] = None
    maxPrice: Optional[float] = None
    status: Optional[ListingStatusEnum] = ListingStatusEnum.AVAILABLE
    isNearExpiryOnly: Optional[bool] = False


# ── Claim Schemas ─────────────────────────────────────────────────────────────

class ClaimCreate(BaseModel):
    buyerId: str


class ClaimRespondRequest(BaseModel):
    accept: bool = Field(..., description="True to accept claim, False to reject")


class ClaimResponse(BaseModel):
    id: str
    listingId: str
    buyerId: str
    status: ClaimStatusEnum
    requestedAt: datetime

    model_config = ConfigDict(from_attributes=True)

"""
schemas.py
----------
Pydantic v2 Schemas for Phase 4 Mini ERP Dashboard API.
Includes inventory, live stats aggregations, AI suggestions, and analytics chart schemas.
"""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from models_db import ClaimStatusEnum, ListingStatusEnum, RoleEnum, StatusEventTypeEnum


# ── Core Schemas ──────────────────────────────────────────────────────────────

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


class StatusEventResponse(BaseModel):
    id: str
    batchId: str
    eventType: StatusEventTypeEnum
    notes: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


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


# ── ERP Mini Dashboard Schemas ────────────────────────────────────────────────

class InventoryItemResponse(BaseModel):
    batchId: str
    produceType: str
    freshStatus: str
    confidence: float
    estimatedShelfLifeDays: int
    isNearExpiry: bool
    listingStatus: str  # unlisted | available | requested | claimed | delivered | expired
    listingPrice: Optional[float] = None
    imageUrl: str
    qrCodeUrl: Optional[str] = None
    trackUrl: str
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)


class ERPStatsResponse(BaseModel):
    totalBatches: int
    freshCount: int
    rottenCount: int
    freshPercentage: float
    rottenPercentage: float
    totalListings: int
    availableListings: int
    claimedCount: int
    deliveredCount: int
    expiredCount: int
    estimatedWasteSavedKg: float
    totalRevenue: float


class AISuggestionResponse(BaseModel):
    id: str
    title: str
    description: str
    priority: str  # high | medium | info
    category: str  # near_expiry | pricing | quality | impact
    actionType: str  # CREATE_LISTING | DISCOUNT_PRICING | INSPECT_SUPPLY | GENERAL
    targetBatchIds: List[str] = []


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
    claimStatusBreakdown: Dict[str, int]

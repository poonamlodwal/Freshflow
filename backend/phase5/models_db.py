"""
models_db.py
------------
SQLAlchemy ORM definitions for Phase 5:
User, Batch, Listing, Claim, StatusEvent, TrainingSample, RetrainHistory.
"""

from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base


class RoleEnum(str, enum.Enum):
    BUSINESS = "BUSINESS"
    BUYER = "BUYER"
    ADMIN = "ADMIN"


class ListingStatusEnum(str, enum.Enum):
    AVAILABLE = "available"
    REQUESTED = "requested"
    CLAIMED = "claimed"
    DELIVERED = "delivered"
    EXPIRED = "expired"


class ClaimStatusEnum(str, enum.Enum):
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DELIVERED = "delivered"


class StatusEventTypeEnum(str, enum.Enum):
    SCANNED = "scanned"
    LISTED = "listed"
    REQUESTED = "requested"
    CLAIMED = "claimed"
    DELIVERED = "delivered"
    EXPIRED = "expired"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    role: Mapped[RoleEnum] = mapped_column(SQLEnum(RoleEnum), nullable=False, default=RoleEnum.BUSINESS)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    batches: Mapped[list[Batch]] = relationship("Batch", back_populates="owner", cascade="all, delete-orphan")
    claims: Mapped[list[Claim]] = relationship("Claim", back_populates="buyer", cascade="all, delete-orphan")


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    ownerId: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    produceType: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    imageUrl: Mapped[str] = mapped_column(String(2048), nullable=False)
    freshStatus: Mapped[str] = mapped_column(String(50), nullable=False)  # fresh | rotten
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    estimatedShelfLifeDays: Mapped[int] = mapped_column(Integer, nullable=False)
    qrCodeUrl: Mapped[str | None] = mapped_column(String(4096), nullable=True)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    owner: Mapped[User] = relationship("User", back_populates="batches")
    listing: Mapped[Listing | None] = relationship("Listing", back_populates="batch", uselist=False, cascade="all, delete-orphan")
    events: Mapped[list[StatusEvent]] = relationship("StatusEvent", back_populates="batch", cascade="all, delete-orphan")
    trainingSamples: Mapped[list[TrainingSample]] = relationship("TrainingSample", back_populates="batch", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    batchId: Mapped[str] = mapped_column(String(36), ForeignKey("batches.id"), unique=True, nullable=False)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[ListingStatusEnum] = mapped_column(
        SQLEnum(ListingStatusEnum),
        nullable=False,
        default=ListingStatusEnum.AVAILABLE,
        index=True,
    )
    expiryWindow: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    batch: Mapped[Batch] = relationship("Batch", back_populates="listing")
    claims: Mapped[list[Claim]] = relationship("Claim", back_populates="listing", cascade="all, delete-orphan")


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    listingId: Mapped[str] = mapped_column(String(36), ForeignKey("listings.id"), nullable=False)
    buyerId: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    status: Mapped[ClaimStatusEnum] = mapped_column(
        SQLEnum(ClaimStatusEnum),
        nullable=False,
        default=ClaimStatusEnum.REQUESTED,
        index=True,
    )
    requestedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    listing: Mapped[Listing] = relationship("Listing", back_populates="claims")
    buyer: Mapped[User] = relationship("User", back_populates="claims")


class StatusEvent(Base):
    __tablename__ = "status_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    batchId: Mapped[str] = mapped_column(String(36), ForeignKey("batches.id"), nullable=False, index=True)
    eventType: Mapped[StatusEventTypeEnum] = mapped_column(SQLEnum(StatusEventTypeEnum), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    batch: Mapped[Batch] = relationship("Batch", back_populates="events")


class TrainingSample(Base):
    """Stores one row per prediction call, updated when corrected by user."""
    __tablename__ = "training_samples"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    batchId: Mapped[str | None] = mapped_column(String(36), ForeignKey("batches.id"), nullable=True)
    imageUrl: Mapped[str] = mapped_column(String(2048), nullable=False)
    predictedLabel: Mapped[str] = mapped_column(String(128), nullable=False)
    correctedLabel: Mapped[str | None] = mapped_column(String(128), nullable=True, default=None)
    usedInRetrain: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    batch: Mapped[Batch | None] = relationship("Batch", back_populates="trainingSamples")


class RetrainHistory(Base):
    """Tracks each model fine-tuning run with before/after accuracy stats."""
    __tablename__ = "retrain_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    samplesUsed: Mapped[int] = mapped_column(Integer, nullable=False)
    accuracyBefore: Mapped[float] = mapped_column(Float, nullable=False)
    accuracyAfter: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="completed")
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

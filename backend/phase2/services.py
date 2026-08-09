"""
services.py
-----------
Reusable domain logic and database service functions for Phase 2.
Encapsulates transaction workflows and status event logging to enforce DRY code.
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from models_db import (
    Batch,
    Claim,
    ClaimStatusEnum,
    Listing,
    ListingStatusEnum,
    RoleEnum,
    StatusEvent,
    StatusEventTypeEnum,
    User,
)
from schemas import (
    BatchCreate,
    BatchResponse,
    ClaimCreate,
    ListingCreate,
    ListingFilter,
    UserCreate,
)


# ── Helper: Audit Event Logging ───────────────────────────────────────────────

async def log_status_event(
    db: AsyncSession,
    batch_id: str,
    event_type: StatusEventTypeEnum,
) -> StatusEvent:
    """Log a status transition event for QR traceability audit trail."""
    event = StatusEvent(
        id=str(uuid.uuid4()),
        batchId=batch_id,
        eventType=event_type,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(event)
    await db.flush()
    return event


# ── User Services ─────────────────────────────────────────────────────────────

async def create_user_service(db: AsyncSession, user_in: UserCreate) -> User:
    query = select(User).where(User.email == user_in.email)
    res = await db.execute(query)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{user_in.email}' already exists.",
        )

    user = User(
        id=str(uuid.uuid4()),
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        location=user_in.location,
    )
    db.add(user)
    await db.flush()
    return user


# ── Batch Services ────────────────────────────────────────────────────────────

def format_batch_response(batch: Batch) -> BatchResponse:
    is_near = batch.estimatedShelfLifeDays <= settings.NEAR_EXPIRY_THRESHOLD
    return BatchResponse(
        id=batch.id,
        ownerId=batch.ownerId,
        produceType=batch.produceType,
        imageUrl=batch.imageUrl,
        freshStatus=batch.freshStatus,
        confidence=batch.confidence,
        estimatedShelfLifeDays=batch.estimatedShelfLifeDays,
        qrCodeUrl=batch.qrCodeUrl,
        isNearExpiry=is_near,
        suggestListing=is_near,
        createdAt=batch.createdAt,
    )


async def create_batch_service(db: AsyncSession, batch_in: BatchCreate) -> Batch:
    user_res = await db.execute(select(User).where(User.id == batch_in.ownerId))
    owner = user_res.scalar_one_or_none()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner user not found.")
    if owner.role != RoleEnum.BUSINESS and owner.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Only Business users can own batches.")

    batch = Batch(
        id=str(uuid.uuid4()),
        ownerId=batch_in.ownerId,
        produceType=batch_in.produceType.lower(),
        imageUrl=batch_in.imageUrl,
        freshStatus=batch_in.freshStatus,
        confidence=batch_in.confidence,
        estimatedShelfLifeDays=batch_in.estimatedShelfLifeDays,
        qrCodeUrl=batch_in.qrCodeUrl,
    )
    db.add(batch)
    await db.flush()

    # Log initial "scanned" event
    await log_status_event(db, batch.id, StatusEventTypeEnum.SCANNED)
    return batch


# ── Listing Services ──────────────────────────────────────────────────────────

async def create_listing_service(db: AsyncSession, listing_in: ListingCreate) -> Listing:
    batch_res = await db.execute(select(Batch).where(Batch.id == listing_in.batchId))
    batch = batch_res.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")

    existing_res = await db.execute(select(Listing).where(Listing.batchId == listing_in.batchId))
    if existing_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Listing already exists for this batch.")

    listing = Listing(
        id=str(uuid.uuid4()),
        batchId=listing_in.batchId,
        price=listing_in.price,
        quantity=listing_in.quantity,
        status=ListingStatusEnum.AVAILABLE,
        expiryWindow=listing_in.expiryWindow,
    )
    db.add(listing)
    await db.flush()

    # Log "listed" event
    await log_status_event(db, batch.id, StatusEventTypeEnum.LISTED)
    
    # Reload with batch relationship
    res = await db.execute(
        select(Listing).options(selectinload(Listing.batch)).where(Listing.id == listing.id)
    )
    return res.scalar_one()


async def get_filtered_listings_service(db: AsyncSession, filters: ListingFilter) -> List[Listing]:
    stmt = select(Listing).join(Listing.batch).join(Batch.owner).options(
        selectinload(Listing.batch)
    )

    if filters.status:
        stmt = stmt.where(Listing.status == filters.status)
    if filters.produceType:
        stmt = stmt.where(Batch.produceType.ilike(f"%{filters.produceType}%"))
    if filters.location:
        stmt = stmt.where(User.location.ilike(f"%{filters.location}%"))
    if filters.maxPrice is not None:
        stmt = stmt.where(Listing.price <= filters.maxPrice)
    if filters.isNearExpiryOnly:
        stmt = stmt.where(Batch.estimatedShelfLifeDays <= settings.NEAR_EXPIRY_THRESHOLD)

    res = await db.execute(stmt)
    return list(res.scalars().all())


# ── Claim Lifecycle Services ──────────────────────────────────────────────────

async def request_claim_service(db: AsyncSession, listing_id: str, buyer_id: str) -> Claim:
    buyer_res = await db.execute(select(User).where(User.id == buyer_id))
    buyer = buyer_res.scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer user not found.")

    listing_res = await db.execute(
        select(Listing).options(selectinload(Listing.batch)).where(Listing.id == listing_id)
    )
    listing = listing_res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")

    if listing.status != ListingStatusEnum.AVAILABLE:
        raise HTTPException(status_code=400, detail=f"Listing is not available for claim (current status: {listing.status.value}).")

    if listing.batch.ownerId == buyer_id:
        raise HTTPException(status_code=400, detail="Business cannot claim its own listing.")

    # Create Claim in 'requested' state
    claim = Claim(
        id=str(uuid.uuid4()),
        listingId=listing_id,
        buyerId=buyer_id,
        status=ClaimStatusEnum.REQUESTED,
    )
    db.add(claim)

    # Update Listing status to 'requested'
    listing.status = ListingStatusEnum.REQUESTED
    await db.flush()

    # Log 'requested' event
    await log_status_event(db, listing.batchId, StatusEventTypeEnum.REQUESTED)
    return claim


async def respond_claim_service(
    db: AsyncSession,
    claim_id: str,
    accept: bool,
) -> Claim:
    claim_res = await db.execute(
        select(Claim).options(selectinload(Claim.listing).selectinload(Listing.batch)).where(Claim.id == claim_id)
    )
    claim = claim_res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    if claim.status != ClaimStatusEnum.REQUESTED:
        raise HTTPException(status_code=400, detail=f"Claim cannot be updated from status '{claim.status.value}'.")

    if accept:
        claim.status = ClaimStatusEnum.ACCEPTED
        claim.listing.status = ListingStatusEnum.CLAIMED
        await log_status_event(db, claim.listing.batchId, StatusEventTypeEnum.CLAIMED)
    else:
        claim.status = ClaimStatusEnum.REJECTED
        claim.listing.status = ListingStatusEnum.AVAILABLE

    await db.flush()
    return claim


async def deliver_claim_service(db: AsyncSession, claim_id: str) -> Claim:
    claim_res = await db.execute(
        select(Claim).options(selectinload(Claim.listing).selectinload(Listing.batch)).where(Claim.id == claim_id)
    )
    claim = claim_res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    if claim.status != ClaimStatusEnum.ACCEPTED:
        raise HTTPException(status_code=400, detail="Only accepted claims can be marked as delivered.")

    claim.status = ClaimStatusEnum.DELIVERED
    claim.listing.status = ListingStatusEnum.DELIVERED
    await db.flush()

    await log_status_event(db, claim.listing.batchId, StatusEventTypeEnum.DELIVERED)
    return claim

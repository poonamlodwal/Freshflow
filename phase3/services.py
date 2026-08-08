"""
services.py
-----------
Reusable domain logic, QR code generation, database services, and public trace query handlers
for Phase 3 QR Traceability.
Encapsulates transaction workflows and status event logging to enforce DRY code.
"""

import base64
import io
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import qrcode
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
    OriginInfo,
    PublicBatchTraceResponse,
    QualityResult,
    TimelineEvent,
    UserCreate,
)


# ── QR Code Utilities ─────────────────────────────────────────────────────────

def get_track_url(batch_id: str) -> str:
    """Build the public track URL for a batch."""
    return f"{settings.FRONTEND_BASE_URL.rstrip('/')}/track/{batch_id}"


def generate_qr_image_bytes(data: str) -> bytes:
    """Generate PNG bytes for a given string using the qrcode library."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def generate_qr_code_base64(batch_id: str) -> str:
    """Generate a scannable QR code encoded as a PNG Base64 Data URI."""
    url = get_track_url(batch_id)
    png_bytes = generate_qr_image_bytes(url)
    encoded = base64.b64encode(png_bytes).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def generate_qr_code_bytes(batch_id: str) -> bytes:
    """Generate raw PNG bytes of the QR code for direct download or display."""
    url = get_track_url(batch_id)
    return generate_qr_image_bytes(url)


# ── Audit Event Logging Helper ────────────────────────────────────────────────

async def log_status_event(
    db: AsyncSession,
    batch_id: str,
    event_type: StatusEventTypeEnum,
    notes: Optional[str] = None,
) -> StatusEvent:
    """Log a status transition event for QR traceability audit trail."""
    event = StatusEvent(
        id=str(uuid.uuid4()),
        batchId=batch_id,
        eventType=event_type,
        notes=notes,
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
    qr_url = batch.qrCodeUrl or generate_qr_code_base64(batch.id)
    return BatchResponse(
        id=batch.id,
        ownerId=batch.ownerId,
        produceType=batch.produceType,
        imageUrl=batch.imageUrl,
        freshStatus=batch.freshStatus,
        confidence=batch.confidence,
        estimatedShelfLifeDays=batch.estimatedShelfLifeDays,
        qrCodeUrl=qr_url,
        trackUrl=get_track_url(batch.id),
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

    batch_id = str(uuid.uuid4())
    # Generate QR code automatically on batch creation if not explicitly provided
    qr_code_url = batch_in.qrCodeUrl or generate_qr_code_base64(batch_id)

    batch = Batch(
        id=batch_id,
        ownerId=batch_in.ownerId,
        produceType=batch_in.produceType.lower(),
        imageUrl=batch_in.imageUrl,
        freshStatus=batch_in.freshStatus,
        confidence=batch_in.confidence,
        estimatedShelfLifeDays=batch_in.estimatedShelfLifeDays,
        qrCodeUrl=qr_code_url,
    )
    db.add(batch)
    await db.flush()

    # Log initial "scanned" event
    await log_status_event(
        db,
        batch.id,
        StatusEventTypeEnum.SCANNED,
        notes=f"Initial AI FreshScan complete. Freshness: {batch.freshStatus} ({batch.confidence*100:.1f}% confidence)",
    )
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
    await log_status_event(
        db,
        batch.id,
        StatusEventTypeEnum.LISTED,
        notes=f"Listed on marketplace for ${listing.price if listing.price is not None else 0:.2f}",
    )

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
        raise HTTPException(
            status_code=400,
            detail=f"Listing is not available for claim (current status: {listing.status.value}).",
        )

    if listing.batch.ownerId == buyer_id:
        raise HTTPException(status_code=400, detail="Business cannot claim its own listing.")

    claim = Claim(
        id=str(uuid.uuid4()),
        listingId=listing_id,
        buyerId=buyer_id,
        status=ClaimStatusEnum.REQUESTED,
    )
    db.add(claim)
    listing.status = ListingStatusEnum.REQUESTED
    await db.flush()

    # Log 'requested' event
    await log_status_event(
        db,
        listing.batchId,
        StatusEventTypeEnum.REQUESTED,
        notes=f"Claim requested by buyer: {buyer.name}",
    )
    return claim


async def respond_claim_service(
    db: AsyncSession,
    claim_id: str,
    accept: bool,
) -> Claim:
    claim_res = await db.execute(
        select(Claim)
        .options(selectinload(Claim.listing).selectinload(Listing.batch))
        .where(Claim.id == claim_id)
    )
    claim = claim_res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    if claim.status != ClaimStatusEnum.REQUESTED:
        raise HTTPException(status_code=400, detail=f"Claim cannot be updated from status '{claim.status.value}'.")

    if accept:
        claim.status = ClaimStatusEnum.ACCEPTED
        claim.listing.status = ListingStatusEnum.CLAIMED
        await log_status_event(
            db,
            claim.listing.batchId,
            StatusEventTypeEnum.CLAIMED,
            notes="Claim accepted by business owner.",
        )
    else:
        claim.status = ClaimStatusEnum.REJECTED
        claim.listing.status = ListingStatusEnum.AVAILABLE

    await db.flush()
    return claim


async def deliver_claim_service(db: AsyncSession, claim_id: str) -> Claim:
    claim_res = await db.execute(
        select(Claim)
        .options(selectinload(Claim.listing).selectinload(Listing.batch))
        .where(Claim.id == claim_id)
    )
    claim = claim_res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    if claim.status != ClaimStatusEnum.ACCEPTED:
        raise HTTPException(status_code=400, detail="Only accepted claims can be marked as delivered.")

    claim.status = ClaimStatusEnum.DELIVERED
    claim.listing.status = ListingStatusEnum.DELIVERED
    await db.flush()

    await log_status_event(
        db,
        claim.listing.batchId,
        StatusEventTypeEnum.DELIVERED,
        notes="Produce successfully delivered to buyer.",
    )
    return claim


# ── Public Trace Record Service (No Auth Required) ─────────────────────────────

EVENT_META = {
    StatusEventTypeEnum.SCANNED: ("Batch Scanned & Verified", "Initial quality assessment completed via FreshScan AI."),
    StatusEventTypeEnum.LISTED: ("Listed on Marketplace", "Published to near-expiry marketplace for discovery."),
    StatusEventTypeEnum.REQUESTED: ("Claim Requested", "Buyer requested to claim produce batch."),
    StatusEventTypeEnum.CLAIMED: ("Claim Accepted", "Business confirmed claim; reserved for pickup/delivery."),
    StatusEventTypeEnum.DELIVERED: ("Order Delivered", "Produce safely transferred to buyer."),
    StatusEventTypeEnum.EXPIRED: ("Batch Expired", "Batch reached expiration window."),
}


async def get_public_batch_trace_service(db: AsyncSession, batch_id: str) -> PublicBatchTraceResponse:
    """Fetch complete public trace record for a batch including origin, quality, and full timeline."""
    stmt = (
        select(Batch)
        .options(selectinload(Batch.owner), selectinload(Batch.events))
        .where(Batch.id == batch_id)
    )
    res = await db.execute(stmt)
    batch = res.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Trace record not found for this batch ID.")

    sorted_events = sorted(batch.events, key=lambda e: e.timestamp)
    latest_event = sorted_events[-1].eventType.value if sorted_events else "scanned"

    timeline: List[TimelineEvent] = []
    for ev in sorted_events:
        default_title, default_desc = EVENT_META.get(
            ev.eventType, ("Status Updated", f"Event transition: {ev.eventType.value}")
        )
        timeline.append(
            TimelineEvent(
                id=ev.id,
                eventType=ev.eventType,
                timestamp=ev.timestamp,
                title=default_title,
                description=ev.notes or default_desc,
            )
        )

    qr_url = batch.qrCodeUrl or generate_qr_code_base64(batch.id)

    return PublicBatchTraceResponse(
        batchId=batch.id,
        produceType=batch.produceType,
        imageUrl=batch.imageUrl,
        qrCodeUrl=qr_url,
        trackUrl=get_track_url(batch.id),
        createdAt=batch.createdAt,
        currentStatus=latest_event,
        origin=OriginInfo(
            ownerId=batch.owner.id,
            ownerName=batch.owner.name,
            location=batch.owner.location,
            email=batch.owner.email,
        ),
        qualityResult=QualityResult(
            freshStatus=batch.freshStatus,
            confidence=batch.confidence,
            estimatedShelfLifeDays=batch.estimatedShelfLifeDays,
        ),
        timeline=timeline,
    )

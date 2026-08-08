"""
services.py
-----------
Reusable domain logic, QR code generation, database services, and live ERP Dashboard engines
(Inventory Search/Sort, Live Stats Aggregation, Actionable AI Suggestion Rules, Analytics Charts) for Phase 4.
Encapsulates transaction workflows and status event logging to enforce DRY code.
"""

import base64
import io
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

import qrcode
from fastapi import HTTPException, status
from sqlalchemy import func, select
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
    AISuggestionResponse,
    AnalyticsChartDataResponse,
    BatchCreate,
    BatchResponse,
    ClaimCreate,
    DailyScanPoint,
    ERPStatsResponse,
    InventoryItemResponse,
    ListingCreate,
    ListingFilter,
    ProduceBreakdown,
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
    """Log a status transition event for audit trail."""
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


# ── Phase 4 Mini ERP Services ─────────────────────────────────────────────────

async def get_erp_inventory_service(
    db: AsyncSession,
    owner_id: Optional[str] = None,
    search: Optional[str] = None,
    fresh_status: Optional[str] = None,
    listing_status: Optional[str] = None,
    sort_by: str = "createdAt",
    sort_order: str = "desc",
) -> List[InventoryItemResponse]:
    """Fetch auto-populated inventory items with search, filter, and sort capabilities."""
    stmt = select(Batch).options(selectinload(Batch.listing))

    if owner_id:
        stmt = stmt.where(Batch.ownerId == owner_id)
    if search:
        stmt = stmt.where(Batch.produceType.ilike(f"%{search}%"))
    if fresh_status:
        stmt = stmt.where(Batch.freshStatus == fresh_status.lower())

    res = await db.execute(stmt)
    batches = res.scalars().all()

    items: List[InventoryItemResponse] = []
    for b in batches:
        l_status = b.listing.status.value if b.listing else "unlisted"
        l_price = b.listing.price if b.listing else None

        if listing_status and l_status.lower() != listing_status.lower():
            continue

        is_near = b.estimatedShelfLifeDays <= settings.NEAR_EXPIRY_THRESHOLD
        qr_url = b.qrCodeUrl or generate_qr_code_base64(b.id)

        items.append(
            InventoryItemResponse(
                batchId=b.id,
                produceType=b.produceType,
                freshStatus=b.freshStatus,
                confidence=b.confidence,
                estimatedShelfLifeDays=b.estimatedShelfLifeDays,
                isNearExpiry=is_near,
                listingStatus=l_status,
                listingPrice=l_price,
                imageUrl=b.imageUrl,
                qrCodeUrl=qr_url,
                trackUrl=get_track_url(b.id),
                createdAt=b.createdAt,
            )
        )

    # Apply sorting
    reverse = sort_order.lower() == "desc"
    if sort_by == "estimatedShelfLifeDays":
        items.sort(key=lambda x: x.estimatedShelfLifeDays, reverse=reverse)
    elif sort_by == "confidence":
        items.sort(key=lambda x: x.confidence, reverse=reverse)
    elif sort_by == "produceType":
        items.sort(key=lambda x: x.produceType, reverse=reverse)
    else:  # createdAt
        items.sort(key=lambda x: x.createdAt, reverse=reverse)

    return items


async def get_erp_stats_service(
    db: AsyncSession,
    owner_id: Optional[str] = None,
) -> ERPStatsResponse:
    """Calculate live aggregated stats: fresh/rotten %, claimed vs expired, revenue, and waste-saved kg."""
    stmt_batch = select(Batch)
    if owner_id:
        stmt_batch = stmt_batch.where(Batch.ownerId == owner_id)
    res_b = await db.execute(stmt_batch)
    batches = list(res_b.scalars().all())

    total_batches = len(batches)
    fresh_count = sum(1 for b in batches if b.freshStatus == "fresh")
    rotten_count = sum(1 for b in batches if b.freshStatus == "rotten")

    fresh_pct = (fresh_count / total_batches * 100.0) if total_batches > 0 else 0.0
    rotten_pct = (rotten_count / total_batches * 100.0) if total_batches > 0 else 0.0

    batch_ids = [b.id for b in batches]
    if batch_ids:
        stmt_listing = select(Listing).where(Listing.batchId.in_(batch_ids))
        res_l = await db.execute(stmt_listing)
        listings = list(res_l.scalars().all())
    else:
        listings = []

    total_listings = len(listings)
    available_listings = sum(1 for l in listings if l.status == ListingStatusEnum.AVAILABLE)
    claimed_count = sum(1 for l in listings if l.status == ListingStatusEnum.CLAIMED)
    delivered_count = sum(1 for l in listings if l.status == ListingStatusEnum.DELIVERED)
    expired_count = sum(1 for l in listings if l.status == ListingStatusEnum.EXPIRED)

    # Waste saved kg: for claimed or delivered listings, quantity * estimated kg per batch
    rescued_listings = [l for l in listings if l.status in (ListingStatusEnum.CLAIMED, ListingStatusEnum.DELIVERED)]
    waste_saved_kg = sum(l.quantity * settings.ESTIMATED_KG_PER_BATCH for l in rescued_listings)

    # Total revenue from rescued listings
    total_revenue = sum(
        (l.price or 0.0) * l.quantity for l in rescued_listings
    )

    return ERPStatsResponse(
        totalBatches=total_batches,
        freshCount=fresh_count,
        rottenCount=rotten_count,
        freshPercentage=round(fresh_pct, 1),
        rottenPercentage=round(rotten_pct, 1),
        totalListings=total_listings,
        availableListings=available_listings,
        claimedCount=claimed_count,
        deliveredCount=delivered_count,
        expiredCount=expired_count,
        estimatedWasteSavedKg=round(waste_saved_kg, 1),
        totalRevenue=round(total_revenue, 2),
    )


async def generate_ai_suggestions_service(
    db: AsyncSession,
    owner_id: Optional[str] = None,
) -> List[AISuggestionResponse]:
    """Dynamic rule-based AI suggestions engine generating actionable recommendations."""
    stmt = select(Batch).options(selectinload(Batch.listing))
    if owner_id:
        stmt = stmt.where(Batch.ownerId == owner_id)
    res = await db.execute(stmt)
    batches = list(res.scalars().all())

    suggestions: List[AISuggestionResponse] = []

    # Rule 1: Near-expiry unlisted fresh produce
    unlisted_near_expiry = [
        b for b in batches
        if b.freshStatus == "fresh"
        and b.estimatedShelfLifeDays <= settings.NEAR_EXPIRY_THRESHOLD
        and b.listing is None
    ]
    if unlisted_near_expiry:
        produce_names = list(set(b.produceType.title() for b in unlisted_near_expiry))
        suggestions.append(
            AISuggestionResponse(
                id=str(uuid.uuid4()),
                title="Action Required: Unlisted Near-Expiry Produce",
                description=f"{len(unlisted_near_expiry)} batch(es) of {', '.join(produce_names)} are expiring in <={settings.NEAR_EXPIRY_THRESHOLD} days and not yet listed. List them on the marketplace now to avoid food waste!",
                priority="high",
                category="near_expiry",
                actionType="CREATE_LISTING",
                targetBatchIds=[b.id for b in unlisted_near_expiry],
            )
        )

    # Rule 2: Imminent expiry available listings (expiring within 24 hours)
    now = datetime.now(timezone.utc)
    imminent_listings = [
        b for b in batches
        if b.listing is not None
        and b.listing.status == ListingStatusEnum.AVAILABLE
        and (b.listing.expiryWindow - now) <= timedelta(hours=24)
    ]
    if imminent_listings:
        suggestions.append(
            AISuggestionResponse(
                id=str(uuid.uuid4()),
                title="Pricing Strategy: Discount Imminent Expiry Produce",
                description=f"{len(imminent_listings)} available listing(s) expire in less than 24 hours. Consider applying a 20% discount to accelerate buyer claims!",
                priority="medium",
                category="pricing",
                actionType="DISCOUNT_PRICING",
                targetBatchIds=[b.id for b in imminent_listings],
            )
        )

    # Rule 3: High rotten scan ratio (> 20%)
    if len(batches) >= 3:
        rotten_count = sum(1 for b in batches if b.freshStatus == "rotten")
        rotten_pct = (rotten_count / len(batches)) * 100.0
        if rotten_pct >= 20.0:
            suggestions.append(
                AISuggestionResponse(
                    id=str(uuid.uuid4()),
                    title="Quality Alert: Elevated Spoilage Rate",
                    description=f"Rotten detection rate is {rotten_pct:.1f}%. Inspect storage conditions (temperature/humidity) or evaluate farm supplier intake quality.",
                    priority="high",
                    category="quality",
                    actionType="INSPECT_SUPPLY",
                    targetBatchIds=[b.id for b in batches if b.freshStatus == "rotten"],
                )
            )

    # Rule 4: Environmental Impact milestone
    rescued_count = sum(1 for b in batches if b.listing and b.listing.status in (ListingStatusEnum.CLAIMED, ListingStatusEnum.DELIVERED))
    if rescued_count > 0:
        waste_saved = rescued_count * settings.ESTIMATED_KG_PER_BATCH
        suggestions.append(
            AISuggestionResponse(
                id=str(uuid.uuid4()),
                title="Sustainability Impact: Waste Rescued",
                description=f"Great impact! Your organization has rescued estimated {waste_saved:.0f} kg of fresh produce from landfill across {rescued_count} claimed batch(es).",
                priority="info",
                category="impact",
                actionType="GENERAL",
                targetBatchIds=[],
            )
        )

    # Default fallback if no specific rule triggered
    if not suggestions:
        suggestions.append(
            AISuggestionResponse(
                id=str(uuid.uuid4()),
                title="Inventory Status Optimal",
                description="All produce batches are in good health and appropriately listed. Continue regular FreshScan inspections.",
                priority="info",
                category="quality",
                actionType="GENERAL",
                targetBatchIds=[],
            )
        )

    return suggestions


async def get_erp_analytics_service(
    db: AsyncSession,
    owner_id: Optional[str] = None,
) -> AnalyticsChartDataResponse:
    """Aggregate analytics data for produce distribution, daily scan trends, and claim status charts."""
    stmt = select(Batch).options(selectinload(Batch.listing))
    if owner_id:
        stmt = stmt.where(Batch.ownerId == owner_id)
    res = await db.execute(stmt)
    batches = list(res.scalars().all())

    # 1. Produce Breakdown
    breakdown_map: Dict[str, Dict[str, int]] = {}
    for b in batches:
        ptype = b.produceType.title()
        if ptype not in breakdown_map:
            breakdown_map[ptype] = {"freshCount": 0, "rottenCount": 0, "total": 0}
        breakdown_map[ptype]["total"] += 1
        if b.freshStatus == "fresh":
            breakdown_map[ptype]["freshCount"] += 1
        else:
            breakdown_map[ptype]["rottenCount"] += 1

    produce_breakdown = [
        ProduceBreakdown(
            produceType=k,
            freshCount=v["freshCount"],
            rottenCount=v["rottenCount"],
            total=v["total"],
        )
        for k, v in breakdown_map.items()
    ]

    # 2. Daily Scan Trend
    trend_map: Dict[str, Dict[str, int]] = {}
    for b in batches:
        date_str = b.createdAt.strftime("%Y-%m-%d")
        if date_str not in trend_map:
            trend_map[date_str] = {"scansCount": 0, "freshCount": 0, "rottenCount": 0}
        trend_map[date_str]["scansCount"] += 1
        if b.freshStatus == "fresh":
            trend_map[date_str]["freshCount"] += 1
        else:
            trend_map[date_str]["rottenCount"] += 1

    daily_trend = [
        DailyScanPoint(
            date=k,
            scansCount=v["scansCount"],
            freshCount=v["freshCount"],
            rottenCount=v["rottenCount"],
        )
        for k, v in sorted(trend_map.items())
    ]

    # 3. Claim Status Breakdown
    claim_status_map: Dict[str, int] = {
        "unlisted": 0,
        "available": 0,
        "requested": 0,
        "claimed": 0,
        "delivered": 0,
        "expired": 0,
    }
    for b in batches:
        if b.listing:
            status_val = b.listing.status.value
            claim_status_map[status_val] = claim_status_map.get(status_val, 0) + 1
        else:
            claim_status_map["unlisted"] += 1

    return AnalyticsChartDataResponse(
        produceBreakdown=produce_breakdown,
        dailyScanTrend=daily_trend,
        claimStatusBreakdown=claim_status_map,
    )

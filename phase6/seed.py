"""
seed.py
-------
Realistic demo data seeder for Phase 6 — Demo Polish.
Seeds users, batches, listings, claims, status event timelines, QR codes,
training samples, and retrain history.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from models_db import (
    Batch,
    Claim,
    ClaimStatusEnum,
    Listing,
    ListingStatusEnum,
    RetrainHistory,
    RoleEnum,
    StatusEvent,
    StatusEventTypeEnum,
    TrainingSample,
    User,
)
from schemas import DemoSeedResponse
from utils import generate_qr_code_bytes

logger = logging.getLogger(__name__)


async def seed_demo_data(db: AsyncSession) -> DemoSeedResponse:
    """Seed realistic demo data into database."""
    logger.info("Starting Phase 6 demo data seeding...")

    # Clear existing demo records to allow clean idempotency
    await db.execute(delete(StatusEvent))
    await db.execute(delete(Claim))
    await db.execute(delete(Listing))
    await db.execute(delete(TrainingSample))
    await db.execute(delete(Batch))
    await db.execute(delete(User))
    await db.execute(delete(RetrainHistory))
    await db.commit()

    now = datetime.now(timezone.utc)

    # 1. Users
    biz1 = User(
        id="usr_biz_freshfarm",
        name="Fresh Farm Co",
        email="contact@freshfarm.com",
        role=RoleEnum.BUSINESS,
        location="Salinas Valley, CA",
        createdAt=now - timedelta(days=5),
    )
    biz2 = User(
        id="usr_biz_ecoorchards",
        name="Eco Orchards",
        email="info@ecoorchards.org",
        role=RoleEnum.BUSINESS,
        location="Hood River, OR",
        createdAt=now - timedelta(days=4),
    )
    buyer1 = User(
        id="usr_buyer_greeneats",
        name="Green Eats Bistro",
        email="buyer@greeneats.com",
        role=RoleEnum.BUYER,
        location="San Francisco, CA",
        createdAt=now - timedelta(days=3),
    )
    admin1 = User(
        id="usr_admin_freshchain",
        name="FreshChain Platform Admin",
        email="admin@freshchain.org",
        role=RoleEnum.ADMIN,
        location="HQ - San Francisco, CA",
        createdAt=now - timedelta(days=10),
    )

    db.add_all([biz1, biz2, buyer1, admin1])
    await db.flush()

    # 2. Batches
    batch_fresh_apple = Batch(
        id="batch_demo_apple_001",
        ownerId=biz1.id,
        produceType="apple",
        imageUrl="https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
        freshStatus="fresh",
        confidence=0.94,
        estimatedShelfLifeDays=7,
        qrCodeUrl="http://localhost:3000/track/batch_demo_apple_001",
        createdAt=now - timedelta(hours=12),
    )
    batch_near_banana = Batch(
        id="batch_demo_banana_002",
        ownerId=biz1.id,
        produceType="banana",
        imageUrl="https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Vanilla-Caramel-Chip-Waffles.jpg",
        freshStatus="fresh",
        confidence=0.72,
        estimatedShelfLifeDays=2,
        qrCodeUrl="http://localhost:3000/track/batch_demo_banana_002",
        createdAt=now - timedelta(hours=8),
    )
    batch_near_strawberry = Batch(
        id="batch_demo_strawberry_003",
        ownerId=biz2.id,
        produceType="strawberry",
        imageUrl="https://upload.wikimedia.org/wikipedia/commons/2/29/Perfect_Strawberry.jpg",
        freshStatus="fresh",
        confidence=0.68,
        estimatedShelfLifeDays=1,
        qrCodeUrl="http://localhost:3000/track/batch_demo_strawberry_003",
        createdAt=now - timedelta(hours=6),
    )
    batch_claimed_tomato = Batch(
        id="batch_demo_tomato_004",
        ownerId=biz1.id,
        produceType="tomato",
        imageUrl="https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
        freshStatus="fresh",
        confidence=0.91,
        estimatedShelfLifeDays=3,
        qrCodeUrl="http://localhost:3000/track/batch_demo_tomato_004",
        createdAt=now - timedelta(days=1),
    )
    batch_delivered_avocado = Batch(
        id="batch_demo_avocado_005",
        ownerId=biz2.id,
        produceType="avocado",
        imageUrl="https://upload.wikimedia.org/wikipedia/commons/c/c9/Avocado_with_cross_section_edit.jpg",
        freshStatus="fresh",
        confidence=0.88,
        estimatedShelfLifeDays=2,
        qrCodeUrl="http://localhost:3000/track/batch_demo_avocado_005",
        createdAt=now - timedelta(days=2),
    )

    batches_list = [
        batch_fresh_apple,
        batch_near_banana,
        batch_near_strawberry,
        batch_claimed_tomato,
        batch_delivered_avocado,
    ]
    db.add_all(batches_list)
    await db.flush()

    # 3. Listings
    listing_banana = Listing(
        id="lst_demo_banana_001",
        batchId=batch_near_banana.id,
        price=1.99,
        quantity=20,
        status=ListingStatusEnum.AVAILABLE,
        expiryWindow=now + timedelta(days=2),
        createdAt=now - timedelta(hours=7),
    )
    listing_strawberry = Listing(
        id="lst_demo_strawberry_002",
        batchId=batch_near_strawberry.id,
        price=2.50,
        quantity=15,
        status=ListingStatusEnum.REQUESTED,
        expiryWindow=now + timedelta(days=1),
        createdAt=now - timedelta(hours=5),
    )
    listing_tomato = Listing(
        id="lst_demo_tomato_003",
        batchId=batch_claimed_tomato.id,
        price=3.00,
        quantity=30,
        status=ListingStatusEnum.CLAIMED,
        expiryWindow=now + timedelta(days=3),
        createdAt=now - timedelta(hours=22),
    )
    listing_avocado = Listing(
        id="lst_demo_avocado_004",
        batchId=batch_delivered_avocado.id,
        price=4.20,
        quantity=25,
        status=ListingStatusEnum.DELIVERED,
        expiryWindow=now + timedelta(days=2),
        createdAt=now - timedelta(days=2),
    )

    listings_list = [listing_banana, listing_strawberry, listing_tomato, listing_avocado]
    db.add_all(listings_list)
    await db.flush()

    # 4. Claims
    claim_strawberry = Claim(
        id="clm_demo_strawberry_001",
        listingId=listing_strawberry.id,
        buyerId=buyer1.id,
        status=ClaimStatusEnum.REQUESTED,
        requestedAt=now - timedelta(hours=4),
    )
    claim_tomato = Claim(
        id="clm_demo_tomato_002",
        listingId=listing_tomato.id,
        buyerId=buyer1.id,
        status=ClaimStatusEnum.ACCEPTED,
        requestedAt=now - timedelta(hours=18),
    )
    claim_avocado = Claim(
        id="clm_demo_avocado_003",
        listingId=listing_avocado.id,
        buyerId=buyer1.id,
        status=ClaimStatusEnum.DELIVERED,
        requestedAt=now - timedelta(days=1, hours=12),
    )

    claims_list = [claim_strawberry, claim_tomato, claim_avocado]
    db.add_all(claims_list)
    await db.flush()

    # 5. Status Events
    events = [
        # Apple
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_fresh_apple.id, eventType=StatusEventTypeEnum.SCANNED, notes="Scanned: Fresh Apple 94%", timestamp=batch_fresh_apple.createdAt),
        # Banana
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_near_banana.id, eventType=StatusEventTypeEnum.SCANNED, notes="Scanned: Fresh Banana 72%", timestamp=batch_near_banana.createdAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_near_banana.id, eventType=StatusEventTypeEnum.LISTED, notes="Listed on Near-Expiry Marketplace at $1.99", timestamp=listing_banana.createdAt),
        # Strawberry
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_near_strawberry.id, eventType=StatusEventTypeEnum.SCANNED, notes="Scanned: Fresh Strawberry 68%", timestamp=batch_near_strawberry.createdAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_near_strawberry.id, eventType=StatusEventTypeEnum.LISTED, notes="Listed on Near-Expiry Marketplace at $2.50", timestamp=listing_strawberry.createdAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_near_strawberry.id, eventType=StatusEventTypeEnum.REQUESTED, notes="Buyer Green Eats Bistro requested claim", timestamp=claim_strawberry.requestedAt),
        # Tomato
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_claimed_tomato.id, eventType=StatusEventTypeEnum.SCANNED, notes="Scanned: Fresh Tomato 91%", timestamp=batch_claimed_tomato.createdAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_claimed_tomato.id, eventType=StatusEventTypeEnum.LISTED, notes="Listed on Near-Expiry Marketplace at $3.00", timestamp=listing_tomato.createdAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_claimed_tomato.id, eventType=StatusEventTypeEnum.REQUESTED, notes="Buyer requested claim", timestamp=claim_tomato.requestedAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_claimed_tomato.id, eventType=StatusEventTypeEnum.CLAIMED, notes="Business accepted claim request", timestamp=now - timedelta(hours=12)),
        # Avocado
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_delivered_avocado.id, eventType=StatusEventTypeEnum.SCANNED, notes="Scanned: Fresh Avocado 88%", timestamp=batch_delivered_avocado.createdAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_delivered_avocado.id, eventType=StatusEventTypeEnum.LISTED, notes="Listed on Near-Expiry Marketplace at $4.20", timestamp=listing_avocado.createdAt),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_delivered_avocado.id, eventType=StatusEventTypeEnum.CLAIMED, notes="Business accepted claim", timestamp=now - timedelta(days=1)),
        StatusEvent(id=str(uuid.uuid4()), batchId=batch_delivered_avocado.id, eventType=StatusEventTypeEnum.DELIVERED, notes="Delivery confirmed & verified via QR scan", timestamp=now - timedelta(hours=2)),
    ]
    db.add_all(events)

    # 6. Training Samples & Retrain History
    s1 = TrainingSample(
        id="smpl_demo_001",
        batchId=batch_fresh_apple.id,
        imageUrl=batch_fresh_apple.imageUrl,
        predictedLabel="freshapple",
        correctedLabel=None,
        usedInRetrain=True,
        createdAt=batch_fresh_apple.createdAt,
    )
    s2 = TrainingSample(
        id="smpl_demo_002",
        batchId=batch_near_banana.id,
        imageUrl=batch_near_banana.imageUrl,
        predictedLabel="rottenbanana",
        correctedLabel="freshbanana",
        usedInRetrain=True,
        createdAt=batch_near_banana.createdAt,
    )
    db.add_all([s1, s2])

    retrain1 = RetrainHistory(
        id="rt_demo_001",
        samplesUsed=25,
        accuracyBefore=0.84,
        accuracyAfter=0.96,
        status="completed",
        createdAt=now - timedelta(hours=3),
    )
    db.add(retrain1)

    await db.commit()
    logger.info("Demo data seeding completed successfully.")

    return DemoSeedResponse(
        status="success",
        message="FreshChain demo database seeded with 4 users, 5 batches, 4 listings, 3 claims, 14 events, and retrain history.",
        usersCount=4,
        batchesCount=5,
        listingsCount=4,
        claimsCount=3,
        eventsCount=len(events),
        retrainHistoryCount=1,
    )

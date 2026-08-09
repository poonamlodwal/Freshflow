"""
main.py
-------
FastAPI entry point for Phase 3 — QR Traceability Backend.
Includes public tracking API, batch creation with dynamic QR generation,
direct PNG QR downloading/printing, and lifecycle status transition events.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from db import close_db, get_session, init_db
from models_db import Batch, Claim, Listing, ListingStatusEnum, StatusEvent, User
from schemas import (
    BatchCreate,
    BatchResponse,
    ClaimCreate,
    ClaimRespondRequest,
    ClaimResponse,
    ListingCreate,
    ListingFilter,
    ListingResponse,
    PublicBatchTraceResponse,
    StatusEventResponse,
    UserCreate,
    UserResponse,
)
from services import (
    create_batch_service,
    create_listing_service,
    create_user_service,
    deliver_claim_service,
    format_batch_response,
    generate_qr_code_bytes,
    get_filtered_listings_service,
    get_public_batch_trace_service,
    request_claim_service,
    respond_claim_service,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("=== FreshChain Phase 3 Backend starting up ===")
    await init_db()
    yield
    logger.info("=== FreshChain Phase 3 Backend shutting down ===")
    await close_db()


app = FastAPI(
    title="FreshChain Phase 3 — QR Traceability API",
    description="Public batch tracking, dynamic QR code generation, download actions, and status event auditing.",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Ops"])
async def health():
    return {"status": "ok", "phase": "Phase 3 — QR Traceability"}


# ── Public Traceability Endpoint (No Auth Required) ───────────────────────────

@app.get("/track/{batch_id}", response_model=PublicBatchTraceResponse, tags=["Public Traceability"])
async def get_public_batch_trace(batch_id: str, db: AsyncSession = Depends(get_session)):
    """Public trace record landing endpoint (scanned by phone camera)."""
    return await get_public_batch_trace_service(db, batch_id)


# ── QR Code Download / View Endpoint ──────────────────────────────────────────

@app.get("/batches/{batch_id}/qr", tags=["Traceability"])
async def get_batch_qr_code(
    batch_id: str,
    download: bool = Query(False, description="Set True to trigger browser file download attachment"),
    db: AsyncSession = Depends(get_session),
):
    """Retrieve scannable PNG QR code for viewing or printing."""
    res = await db.execute(select(Batch).where(Batch.id == batch_id))
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Batch not found.")

    png_bytes = generate_qr_code_bytes(batch_id)
    headers = {}
    if download:
        headers["Content-Disposition"] = f'attachment; filename="qr_batch_{batch_id}.png"'

    return Response(content=png_bytes, media_type="image/png", headers=headers)


# ── User Endpoints ────────────────────────────────────────────────────────────

@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Users"])
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_session)):
    return await create_user_service(db, user_in)


@app.get("/users", response_model=List[UserResponse], tags=["Users"])
async def list_users(db: AsyncSession = Depends(get_session)):
    res = await db.execute(select(User))
    return list(res.scalars().all())


@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
async def get_user(user_id: str, db: AsyncSession = Depends(get_session)):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


# ── Batch Endpoints ───────────────────────────────────────────────────────────

@app.post("/batches", response_model=BatchResponse, status_code=status.HTTP_201_CREATED, tags=["Batches"])
async def create_batch(batch_in: BatchCreate, db: AsyncSession = Depends(get_session)):
    batch = await create_batch_service(db, batch_in)
    return format_batch_response(batch)


@app.get("/batches", response_model=List[BatchResponse], tags=["Batches"])
async def list_batches(ownerId: Optional[str] = None, db: AsyncSession = Depends(get_session)):
    stmt = select(Batch)
    if ownerId:
        stmt = stmt.where(Batch.ownerId == ownerId)
    res = await db.execute(stmt)
    batches = res.scalars().all()
    return [format_batch_response(b) for b in batches]


@app.get("/batches/{batch_id}", response_model=BatchResponse, tags=["Batches"])
async def get_batch(batch_id: str, db: AsyncSession = Depends(get_session)):
    res = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = res.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")
    return format_batch_response(batch)


@app.get("/batches/{batch_id}/events", response_model=List[StatusEventResponse], tags=["Traceability"])
async def get_batch_events(batch_id: str, db: AsyncSession = Depends(get_session)):
    res = await db.execute(
        select(StatusEvent).where(StatusEvent.batchId == batch_id).order_by(StatusEvent.timestamp.asc())
    )
    return list(res.scalars().all())


# ── Listing Endpoints ─────────────────────────────────────────────────────────

@app.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED, tags=["Listings"])
async def create_listing(listing_in: ListingCreate, db: AsyncSession = Depends(get_session)):
    listing = await create_listing_service(db, listing_in)
    return ListingResponse(
        id=listing.id,
        batchId=listing.batchId,
        price=listing.price,
        quantity=listing.quantity,
        status=listing.status,
        expiryWindow=listing.expiryWindow,
        createdAt=listing.createdAt,
        batch=format_batch_response(listing.batch),
    )


@app.get("/listings", response_model=List[ListingResponse], tags=["Listings"])
async def get_listings(
    produceType: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    maxPrice: Optional[float] = Query(None),
    status: Optional[ListingStatusEnum] = Query(ListingStatusEnum.AVAILABLE),
    isNearExpiryOnly: Optional[bool] = Query(False),
    db: AsyncSession = Depends(get_session),
):
    filters = ListingFilter(
        produceType=produceType,
        location=location,
        maxPrice=maxPrice,
        status=status,
        isNearExpiryOnly=isNearExpiryOnly,
    )
    listings = await get_filtered_listings_service(db, filters)
    return [
        ListingResponse(
            id=l.id,
            batchId=l.batchId,
            price=l.price,
            quantity=l.quantity,
            status=l.status,
            expiryWindow=l.expiryWindow,
            createdAt=l.createdAt,
            batch=format_batch_response(l.batch),
        )
        for l in listings
    ]


@app.get("/listings/{listing_id}", response_model=ListingResponse, tags=["Listings"])
async def get_listing(listing_id: str, db: AsyncSession = Depends(get_session)):
    res = await db.execute(
        select(Listing).options(selectinload(Listing.batch)).where(Listing.id == listing_id)
    )
    listing = res.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return ListingResponse(
        id=listing.id,
        batchId=listing.batchId,
        price=listing.price,
        quantity=listing.quantity,
        status=listing.status,
        expiryWindow=listing.expiryWindow,
        createdAt=listing.createdAt,
        batch=format_batch_response(listing.batch),
    )


# ── Claim Lifecycle Endpoints ─────────────────────────────────────────────────

@app.post("/listings/{listing_id}/claim", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED, tags=["Claims"])
async def claim_listing(listing_id: str, claim_in: ClaimCreate, db: AsyncSession = Depends(get_session)):
    return await request_claim_service(db, listing_id, claim_in.buyerId)


@app.post("/claims/{claim_id}/respond", response_model=ClaimResponse, tags=["Claims"])
async def respond_to_claim(claim_id: str, body: ClaimRespondRequest, db: AsyncSession = Depends(get_session)):
    return await respond_claim_service(db, claim_id, body.accept)


@app.post("/claims/{claim_id}/deliver", response_model=ClaimResponse, tags=["Claims"])
async def mark_delivered(claim_id: str, db: AsyncSession = Depends(get_session)):
    return await deliver_claim_service(db, claim_id)

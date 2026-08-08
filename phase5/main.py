"""
main.py
-------
FastAPI entry point for Phase 5 — Fine-Tuning Loop & ML Service.

Routes:
  Ops:
    GET  /health                      → service health & model status
  Predict:
    POST /predict/url                 → predict & log TrainingSample
    POST /predict/upload              → predict from upload & log TrainingSample
  Phase 5 Fine-Tuning:
    GET  /samples                     → list recorded training samples
    POST /samples/{sample_id}/correct  → allow user to correct wrong prediction
    POST /retrain                     → trigger non-blocking model fine-tuning
    GET  /retrain/history             → retrain history list
    GET  /admin/retrain-summary       → Admin dashboard deliverable summary
  Domain & ERP:
    /users, /batches, /listings, /claims, /erp/stats, /erp/inventory, /erp/suggestions
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, List, Optional

from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import close_db, get_session, init_db
from model import model_service
from schemas import (
    AdminRetrainSummaryResponse,
    AISuggestionResponse,
    AnalyticsChartDataResponse,
    BatchCreate,
    BatchResponse,
    ClaimCreate,
    ClaimRespondRequest,
    ClaimResponse,
    CorrectSampleRequest,
    ERPStatsResponse,
    HealthResponse,
    InventoryItemResponse,
    ListingCreate,
    ListingFilter,
    ListingResponse,
    ListingStatusEnum,
    PredictResponse,
    PredictURLRequest,
    RetrainHistoryResponse,
    RetrainRequest,
    RetrainResponse,
    StatusEventResponse,
    TrainingSampleResponse,
    UserCreate,
    UserResponse,
)
from services import (
    correct_sample_label,
    create_batch_service,
    create_listing_service,
    create_user_service,
    deliver_claim_service,
    execute_retrain_job,
    format_batch_response,
    generate_ai_suggestions_service,
    get_admin_retrain_summary,
    get_erp_analytics_service,
    get_erp_inventory_service,
    get_erp_stats_service,
    get_filtered_listings_service,
    get_retrain_history_list,
    list_training_samples,
    log_training_sample,
    request_claim_service,
    respond_claim_service,
)
from utils import fetch_image_from_url, generate_qr_code_bytes, load_image_from_bytes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("=== FreshChain Phase 5 ML Service starting up ===")
    await init_db()
    asyncio.get_event_loop().run_in_executor(None, model_service.load)
    yield
    logger.info("=== FreshChain Phase 5 ML Service shutting down ===")
    await close_db()


app = FastAPI(
    title="FreshChain Phase 5 — Fine-Tuning Loop API",
    description="ML service with prediction logging, user corrections, non-blocking retraining, and admin dashboard deliverable.",
    version="5.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Internal Prediction Helper ────────────────────────────────────────────────

async def _run_prediction_and_log(
    image: Image.Image,
    image_url: str,
    db: AsyncSession,
) -> PredictResponse:
    try:
        result = model_service.predict(image)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )

    # Log prediction as TrainingSample (Phase 5 requirement)
    sample = await log_training_sample(
        db=db,
        image_url=image_url,
        predicted_label=result.rawLabel,
    )
    result.sampleId = sample.id
    return result


# ── Ops ───────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Ops"])
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        modelLoaded=model_service.is_loaded,
        modelId=model_service.model_id,
        phase="Phase 5 — Fine-Tuning Loop",
    )


# ── Predict Endpoints ─────────────────────────────────────────────────────────

@app.post("/predict/url", response_model=PredictResponse, tags=["Predict"])
async def predict_from_url(
    body: PredictURLRequest,
    db: AsyncSession = Depends(get_session),
) -> PredictResponse:
    url_str = str(body.imageUrl)
    image = await fetch_image_from_url(url_str)
    return await _run_prediction_and_log(image=image, image_url=url_str, db=db)


@app.post("/predict/upload", response_model=PredictResponse, tags=["Predict"])
async def predict_from_upload(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session),
) -> PredictResponse:
    raw_bytes = await file.read()
    image = load_image_from_bytes(raw_bytes)
    identifier = file.filename or "uploaded_image"
    return await _run_prediction_and_log(image=image, image_url=identifier, db=db)


# ── Phase 5 Fine-Tuning Loop Endpoints ────────────────────────────────────────

@app.get("/samples", response_model=List[TrainingSampleResponse], tags=["Phase 5 Fine-Tuning"])
async def get_samples(
    limit: int = Query(50, ge=1, le=200),
    usedInRetrain: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_session),
):
    """Retrieve logged training samples."""
    return await list_training_samples(db, limit=limit, used_in_retrain=usedInRetrain)


@app.post("/samples/{sample_id}/correct", response_model=TrainingSampleResponse, tags=["Phase 5 Fine-Tuning"])
async def correct_sample(
    sample_id: str,
    body: CorrectSampleRequest,
    db: AsyncSession = Depends(get_session),
):
    """Allow user/admin to correct a wrong prediction label."""
    return await correct_sample_label(db, sample_id, body.correctedLabel)


@app.post("/retrain", response_model=RetrainResponse, tags=["Phase 5 Fine-Tuning"])
async def trigger_retrain(
    background_tasks: BackgroundTasks,
    body: RetrainRequest = RetrainRequest(),
):
    """
    Build /retrain endpoint: fine-tunes final layer(s) on accumulated samples.
    Executes without blocking live /predict traffic.
    """
    sample_limit = body.sampleLimit or settings.DEFAULT_RETRAIN_SAMPLE_LIMIT
    # Run retraining job immediately in an async background context
    result = await execute_retrain_job(sample_limit=sample_limit)
    return result


@app.get("/retrain/history", response_model=List[RetrainHistoryResponse], tags=["Phase 5 Fine-Tuning"])
async def get_retrain_history(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
):
    """Fetch history of model fine-tuning runs."""
    return await get_retrain_history_list(db, limit=limit)


@app.get("/admin/retrain-summary", response_model=AdminRetrainSummaryResponse, tags=["Phase 5 Fine-Tuning"])
async def get_admin_summary(db: AsyncSession = Depends(get_session)):
    """
    Deliverable: Admin dashboard panel showing:
    "Model retrained on X new samples — accuracy improved from Y% to Z%."
    """
    return await get_admin_retrain_summary(db)


# ── Domain & ERP Endpoints ────────────────────────────────────────────────────

@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Users"])
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_session)):
    return await create_user_service(db, user_in)


@app.post("/batches", response_model=BatchResponse, status_code=status.HTTP_201_CREATED, tags=["Batches"])
async def create_batch(batch_in: BatchCreate, db: AsyncSession = Depends(get_session)):
    batch = await create_batch_service(db, batch_in)
    return format_batch_response(batch)


@app.get("/batches/{batch_id}/qr", tags=["Traceability"])
async def get_batch_qr_code(batch_id: str, download: bool = False):
    png_bytes = generate_qr_code_bytes(batch_id)
    headers = {}
    if download:
        headers["Content-Disposition"] = f'attachment; filename="qr_batch_{batch_id}.png"'
    return Response(content=png_bytes, media_type="image/png", headers=headers)


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
    status: Optional[ListingStatusEnum] = Query(ListingStatusEnum.AVAILABLE),
    db: AsyncSession = Depends(get_session),
):
    filters = ListingFilter(produceType=produceType, status=status)
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


@app.post("/listings/{listing_id}/claim", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED, tags=["Claims"])
async def claim_listing(listing_id: str, claim_in: ClaimCreate, db: AsyncSession = Depends(get_session)):
    return await request_claim_service(db, listing_id, claim_in.buyerId)


@app.post("/claims/{claim_id}/respond", response_model=ClaimResponse, tags=["Claims"])
async def respond_to_claim(claim_id: str, body: ClaimRespondRequest, db: AsyncSession = Depends(get_session)):
    return await respond_claim_service(db, claim_id, body.accept)


@app.post("/claims/{claim_id}/deliver", response_model=ClaimResponse, tags=["Claims"])
async def mark_delivered(claim_id: str, db: AsyncSession = Depends(get_session)):
    return await deliver_claim_service(db, claim_id)


@app.get("/erp/stats", response_model=ERPStatsResponse, tags=["ERP Dashboard"])
async def get_erp_stats(ownerId: Optional[str] = Query(None), db: AsyncSession = Depends(get_session)):
    return await get_erp_stats_service(db, owner_id=ownerId)


@app.get("/erp/inventory", response_model=List[InventoryItemResponse], tags=["ERP Dashboard"])
async def get_erp_inventory(ownerId: Optional[str] = Query(None), db: AsyncSession = Depends(get_session)):
    return await get_erp_inventory_service(db, owner_id=ownerId)


@app.get("/erp/suggestions", response_model=List[AISuggestionResponse], tags=["ERP Dashboard"])
async def get_erp_ai_suggestions(ownerId: Optional[str] = Query(None), db: AsyncSession = Depends(get_session)):
    return await generate_ai_suggestions_service(db, owner_id=ownerId)


@app.get("/erp/analytics", response_model=AnalyticsChartDataResponse, tags=["ERP Dashboard"])
async def get_erp_analytics(ownerId: Optional[str] = Query(None), db: AsyncSession = Depends(get_session)):
    return await get_erp_analytics_service(db, owner_id=ownerId)

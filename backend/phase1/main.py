"""
main.py
-------
FastAPI application entry point for the FreshChain ML service.

Routes:
    GET  /health           → service liveness + model status
    POST /predict/url      → predict from a publicly accessible image URL
    POST /predict/upload   → predict from a multipart file upload

Design notes:
    - Model is loaded ONCE in the lifespan context (startup), never per-request.
    - Both predict routes share the same _run_prediction() helper — no
      duplicated inference, DB-write, or response-building logic.
    - TrainingSample is written asynchronously; it never blocks the response.
    - CORS is configured via settings.ALLOWED_ORIGINS (comma-separated).
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import AsyncSessionLocal, close_db, get_session, init_db
from model import model_service
from models_db import TrainingSample
from schemas import HealthResponse, PredictResponse, PredictURLRequest
from utils import fetch_image_from_url, load_image_from_bytes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Startup: init DB tables, then load the HF model in a thread pool so the
    event loop (and /health) remains responsive during the ~model-download.
    Shutdown: close DB connection pool.
    """
    logger.info("=== FreshChain ML Service starting up ===")
    await init_db()
    # Run the blocking model.load() off the event loop so uvicorn finishes
    # startup immediately and /health can respond (modelLoaded=False) while
    # the weights download on first run.
    asyncio.get_running_loop().run_in_executor(None, model_service.load)
    yield
    logger.info("=== FreshChain ML Service shutting down ===")
    await close_db()


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="FreshChain ML Service",
    description=(
        "AI-powered produce quality detection. "
        f"Powered by [{settings.HF_MODEL_ID}](https://huggingface.co/{settings.HF_MODEL_ID}) "
        "via Hugging Face 🤗"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Shared prediction helper ──────────────────────────────────────────────────

async def _run_prediction(
    image: Image.Image,
    image_url: str,
    db: AsyncSession,
) -> PredictResponse:
    """
    Core logic shared by both predict routes.

    Steps:
    1. Call model_service.predict() — the single inference entry point.
    2. Persist a TrainingSample row for Phase 5 fine-tuning readiness.
    3. Return the structured PredictResponse.

    Args:
        image:     PIL Image already loaded by the caller.
        image_url: URL or identifier stored in TrainingSample.imageUrl.
        db:        Injected AsyncSession for the DB write.
    """
    # ── Inference ──────────────────────────────────────────────────────
    try:
        result = model_service.predict(image)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )

    # ── Persist TrainingSample (non-blocking write) ────────────────────
    sample = TrainingSample(
        id=str(uuid.uuid4()),
        imageUrl=image_url,
        predictedLabel=result.rawLabel,
        correctedLabel=None,
        usedInRetrain=False,
    )
    db.add(sample)
    # Commit is handled automatically by get_session() on successful response.

    logger.info(
        "Prediction: label=%s confidence=%.2f shelf_life=%dd near_expiry=%s",
        result.rawLabel,
        result.confidence,
        result.estimatedShelfLifeDays,
        result.isNearExpiry,
    )
    return result


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    tags=["Ops"],
)
async def health() -> HealthResponse:
    """
    Returns the service liveness status and whether the ML model is loaded.
    Next.js should check this before surfacing the scan UI to users.
    """
    return HealthResponse(
        status="ok",
        modelLoaded=model_service.is_loaded,
        modelId=model_service.model_id,
    )


@app.post(
    "/predict/url",
    response_model=PredictResponse,
    summary="Predict from image URL",
    tags=["Predict"],
    responses={
        422: {"description": "Invalid request body"},
        502: {"description": "Could not fetch image from the provided URL"},
        503: {"description": "ML model not loaded"},
    },
)
async def predict_from_url(
    body: PredictURLRequest,
    db: AsyncSession = Depends(get_session),
) -> PredictResponse:
    """
    Primary predict route used by the Next.js backend.

    Flow:
        Next.js uploads image to object storage → gets public URL →
        calls this endpoint with `{ imageUrl: "https://..." }` →
        returns quality prediction.
    """
    url_str = str(body.imageUrl)
    image = await fetch_image_from_url(url_str)
    return await _run_prediction(image=image, image_url=url_str, db=db)


@app.post(
    "/predict/upload",
    response_model=PredictResponse,
    summary="Predict from multipart file upload",
    tags=["Predict"],
    responses={
        422: {"description": "Invalid or corrupt image file"},
        503: {"description": "ML model not loaded"},
    },
)
async def predict_from_upload(
    file: UploadFile = File(
        ...,
        description="Produce image file (JPEG, PNG, WebP).",
    ),
    db: AsyncSession = Depends(get_session),
) -> PredictResponse:
    """
    Fallback predict route for direct file uploads (useful for local dev/testing).

    In production the Next.js app will prefer /predict/url (image already
    stored in object storage), but this endpoint is available for CLI testing
    and future mobile-direct flows.
    """
    raw_bytes = await file.read()
    image = load_image_from_bytes(raw_bytes)
    # Store filename as the identifier (no persistent URL in upload flow)
    identifier = file.filename or "uploaded_image"
    return await _run_prediction(image=image, image_url=identifier, db=db)

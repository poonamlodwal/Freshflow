"""
routers/predict.py — POST /predict

Accepts either:
  (a) JSON body  { "imageUrl": "https://..." }
  (b) Multipart  image file upload  (for future direct-upload support)

Pipeline:
  image_service (fetch/decode) → model_service (inference) → shelf_life (days)
  → PredictResponse

The router is deliberately thin: no business logic lives here.
All logic is in the service layer so it can be unit-tested independently.
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.dependencies import get_model_bundle
from app.schemas.predict import PredictRequest, PredictResponse
from app.services import image_service, model_service, shelf_life
from app.services.model_service import ModelBundle

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Predict"])


# ── Helper: run the full prediction pipeline ───────────────────────────────


def _predict_from_image(
    bundle: ModelBundle,
    pil_image,
) -> PredictResponse:
    """
    Shared prediction logic used by both JSON-URL and multipart routes.
    Separated into a function to avoid duplicating the service-call chain.
    """
    result = model_service.run_inference(bundle, pil_image)
    days = shelf_life.estimate_shelf_life(result.produce_type, result.fresh_status)

    return PredictResponse(
        produceType=result.produce_type,
        freshStatus=result.fresh_status,
        confidence=result.confidence,
        estimatedShelfLifeDays=days,
    )


# ── Route A: JSON body with imageUrl ──────────────────────────────────────


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Classify produce freshness from an image URL",
    description=(
        "Pass an image URL. The service downloads the image, runs the HF "
        "classifier, and returns produce type, freshness status, confidence "
        "score, and estimated shelf-life in days.\n\n"
        "**Model:** jazzmacedo/fruits-and-vegetables-detector-36 (ResNet-50) "
        "via Hugging Face — attributed per architecture.md."
    ),
)
async def predict_from_url(
    body: PredictRequest,
    bundle: Annotated[ModelBundle, Depends(get_model_bundle)],
) -> PredictResponse:
    try:
        image = await image_service.fetch_image_from_url(str(body.imageUrl))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    try:
        return _predict_from_image(bundle, image)
    except Exception as exc:
        logger.exception("Inference failed for URL %s", body.imageUrl)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {exc}",
        ) from exc


# ── Route B: Multipart file upload ────────────────────────────────────────


@router.post(
    "/predict/upload",
    response_model=PredictResponse,
    summary="Classify produce freshness from a direct file upload",
    description=(
        "Upload an image file directly (JPEG/PNG/WEBP). "
        "Returns the same response schema as POST /predict."
    ),
)
async def predict_from_upload(
    file: Annotated[UploadFile, File(description="Produce image (JPEG / PNG / WEBP)")],
    bundle: Annotated[ModelBundle, Depends(get_model_bundle)],
) -> PredictResponse:
    raw = await file.read()

    try:
        image = image_service.decode_image_from_bytes(raw)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    try:
        return _predict_from_image(bundle, image)
    except Exception as exc:
        logger.exception("Inference failed for uploaded file")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {exc}",
        ) from exc

"""
main.py — FastAPI application entry point.

Responsibilities:
  1. Create the FastAPI app with metadata and lifespan.
  2. Load the HF model ONCE at startup (stored in app.state).
  3. Configure CORS — only the Next.js origin is whitelisted.
  4. Mount all routers.

Rules enforced (rules_and_avoid.md §2):
  - Model loaded in lifespan, not per-request.
  - CORS restricted to ML_SERVICE_URL caller only (no wildcard in production).
  - Browser must never call this service directly.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, predict, retrain
from app.services.image_service import close_http_client
from app.services.model_service import load_model

# ── Logging ────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: load model into app.state (once, never per-request).
    Shutdown: close the shared HTTP client used by image_service.
    """
    settings = get_settings()

    logger.info("=== FreshChain ML Service starting up ===")
    logger.info("Model: %s", settings.hf_model_id)
    logger.info("Environment: %s", settings.env)

    try:
        app.state.model_bundle = load_model(settings.hf_model_id)
        logger.info("Model ready — service accepting traffic.")
    except RuntimeError as exc:
        # Don't crash the process; /health will report model_loaded=False
        logger.error("Model failed to load: %s", exc)
        app.state.model_bundle = None

    yield  # ← app is live here

    logger.info("=== FreshChain ML Service shutting down ===")
    await close_http_client()


# ── App factory ────────────────────────────────────────────────────────────


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="FreshChain ML Service",
        description=(
            "AI-powered produce freshness classification service for FreshChain.\n\n"
            "**Model:** [jazzmacedo/fruits-and-vegetables-detector-36]"
            "(https://huggingface.co/jazzmacedo/fruits-and-vegetables-detector-36) "
            "via Hugging Face (ResNet-50, fine-tuned on 36 produce classes).\n\n"
            "This service is called by the Next.js app only — never directly from the browser."
        ),
        version="1.0.0",
        docs_url="/docs" if settings.env != "production" else None,
        redoc_url="/redoc" if settings.env != "production" else None,
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────
    # Restricted to the configured origins (Next.js app URL).
    # No wildcard in production — browser should never call this service
    # directly anyway, but CORS headers are a defence-in-depth measure.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "X-Internal-Secret"],
    )

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(health.router)
    app.include_router(predict.router)
    app.include_router(retrain.router)

    return app


# Single app instance used by uvicorn
app = create_app()

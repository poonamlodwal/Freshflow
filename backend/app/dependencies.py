"""
dependencies.py — Shared FastAPI dependency functions.

All endpoints that need the model use get_model_bundle() as a dependency.
This is the single choke-point: if the model is not loaded,
every predict call returns 503 instead of crashing with an AttributeError.
"""

from __future__ import annotations

import logging
import secrets

from fastapi import Depends, Header, HTTPException, Request, status

from app.config import Settings, get_settings
from app.services.model_service import ModelBundle

logger = logging.getLogger(__name__)


# ── Model dependency ───────────────────────────────────────────────────────


def get_model_bundle(request: Request) -> ModelBundle:
    """
    Retrieve the loaded ModelBundle from app.state.

    Raises 503 if the model is not yet ready (e.g. still loading at startup
    or if loading failed). This lets the app accept traffic immediately while
    returning a clean error instead of a 500 traceback.
    """
    bundle: ModelBundle | None = getattr(request.app.state, "model_bundle", None)
    if bundle is None:
        logger.warning("Prediction requested but model is not loaded")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model is not ready. Please retry in a few seconds.",
        )
    return bundle


# ── Internal-secret dependency ─────────────────────────────────────────────


def require_internal_secret(
    x_internal_secret: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    """
    Guard internal-only endpoints (e.g. /retrain) with a shared secret.

    The browser / Next.js client must never call these endpoints.
    The secret is compared in constant time to prevent timing attacks.
    """
    if x_internal_secret is None or not secrets.compare_digest(
        x_internal_secret, settings.internal_secret
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing or invalid X-Internal-Secret header.",
        )

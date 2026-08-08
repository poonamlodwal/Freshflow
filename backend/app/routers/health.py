"""
routers/health.py — GET /health

Returns service status, model availability, and uptime.
Used by Render/HF Spaces uptime checks and by the Next.js health-ping test button.
"""

from __future__ import annotations

import time

from fastapi import APIRouter, Depends, Request

from app.config import Settings, get_settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])

# Module-level startup timestamp (set when the router module is first imported)
_start_time = time.monotonic()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    description=(
        "Returns 200 with `status=ok` when the model is loaded and ready. "
        "Returns 200 with `status=degraded` when the service is running but "
        "the model has not finished loading yet."
    ),
)
def health_check(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> HealthResponse:
    model_bundle = getattr(request.app.state, "model_bundle", None)
    model_loaded = model_bundle is not None

    return HealthResponse(
        status="ok" if model_loaded else "degraded",
        model_loaded=model_loaded,
        model_id=model_bundle.model_id if model_loaded else settings.hf_model_id,
        uptime_seconds=round(time.monotonic() - _start_time, 2),
        env=settings.env,
    )

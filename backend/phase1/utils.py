"""
utils.py
--------
Shared helper functions used across routes and services.
All image-fetching and shelf-life logic lives here so it is never duplicated.
"""

from __future__ import annotations

import io
import logging
from typing import Tuple

import httpx
from PIL import Image
from fastapi import HTTPException, status

from config import settings

logger = logging.getLogger(__name__)


# ── Image helpers ─────────────────────────────────────────────────────────────

async def fetch_image_from_url(url: str) -> Image.Image:
    """
    Download an image from a public URL and return a PIL Image.

    Raises HTTPException(502) if the download fails or the content is not
    a valid image, so the caller does not need extra try/except.
    """
    try:
        async with httpx.AsyncClient(timeout=settings.IMAGE_FETCH_TIMEOUT) as client:
            response = await client.get(url)
            response.raise_for_status()
            return _bytes_to_image(response.content, source=url)
    except httpx.HTTPStatusError as exc:
        logger.error("Failed to fetch image from %s: HTTP %s", url, exc.response.status_code)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not retrieve image from URL (HTTP {exc.response.status_code}).",
        )
    except httpx.RequestError as exc:
        logger.error("Network error fetching image from %s: %s", url, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Network error while fetching image from URL.",
        )


def load_image_from_bytes(data: bytes) -> Image.Image:
    """
    Convert raw bytes (from a multipart upload) into a PIL Image.

    Raises HTTPException(422) if the bytes are not a valid image.
    """
    return _bytes_to_image(data, source="upload")


def _bytes_to_image(data: bytes, source: str) -> Image.Image:
    """Internal conversion — shared by URL fetch and upload paths."""
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()                     # catch truncated/corrupt files early
        # Re-open after verify (verify() exhausts the stream)
        img = Image.open(io.BytesIO(data)).convert("RGB")
        return img
    except Exception as exc:
        logger.error("Invalid image data from %s: %s", source, exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The provided file is not a valid image.",
        )


# ── Label parsing ─────────────────────────────────────────────────────────────

# Maps label prefixes/keywords → (freshStatus, produceType stem).
# The HF model (`jazzmacedo/fruits-and-vegetables-detector-36`) emits labels like:
#   "freshapple", "rottenapple", "freshbanana", "rottenbanana", …
_FRESH_KEYWORDS = ("fresh",)
_ROTTEN_KEYWORDS = ("rotten", "stale", "bad", "spoil")


def parse_hf_label(raw_label: str) -> Tuple[str, str]:
    """
    Parse a raw HF label string into (freshStatus, produceType).

    Examples:
        "freshapple"   → ("fresh",  "apple")
        "rottenbanana" → ("rotten", "banana")
        "Fresh Apple"  → ("fresh",  "apple")

    Returns ("unknown", raw_label) for anything that doesn't match.
    """
    normalised = raw_label.lower().replace(" ", "").replace("_", "").replace("-", "")

    fresh_status = "unknown"
    produce_stem = normalised

    for kw in _FRESH_KEYWORDS:
        if normalised.startswith(kw):
            fresh_status = "fresh"
            produce_stem = normalised[len(kw):]
            break

    if fresh_status == "unknown":
        for kw in _ROTTEN_KEYWORDS:
            if normalised.startswith(kw):
                fresh_status = "rotten"
                produce_stem = normalised[len(kw):]
                break

    # Fallback: label might just be a produce name with no freshness prefix
    if fresh_status == "unknown":
        produce_stem = normalised
        fresh_status = "unknown"

    produce_type = produce_stem if produce_stem else raw_label.lower()
    return fresh_status, produce_type


# ── Shelf-life estimation ─────────────────────────────────────────────────────

def compute_shelf_life(fresh_status: str, confidence: float) -> int:
    """
    Rule-based shelf-life estimate in days.

    Logic:
    - "fresh"   → SHELF_LIFE_FRESH_DAYS (full), scaled down proportionally if
                  confidence < 0.7 to surface borderline cases.
    - "rotten"  → SHELF_LIFE_ROTTEN_DAYS (always 0).
    - "unknown" → SHELF_LIFE_EXPIRING_DAYS as a conservative default.

    This is intentionally simple for Phase 1; Phase 5 can replace with a
    regression model trained on accumulated TrainingSamples.
    """
    if fresh_status == "rotten":
        return settings.SHELF_LIFE_ROTTEN_DAYS

    if fresh_status == "fresh":
        # High confidence → full shelf life; low confidence → treat as expiring soon.
        if confidence >= 0.7:
            return settings.SHELF_LIFE_FRESH_DAYS
        return settings.SHELF_LIFE_EXPIRING_DAYS

    # "unknown" or any unrecognised status → conservative estimate
    return settings.SHELF_LIFE_EXPIRING_DAYS


def is_near_expiry(shelf_life_days: int) -> bool:
    """Return True if the batch should be auto-flagged for near-expiry listing."""
    return shelf_life_days <= settings.NEAR_EXPIRY_THRESHOLD

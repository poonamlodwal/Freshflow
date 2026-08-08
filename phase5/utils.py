"""
utils.py
--------
Shared helper functions for Phase 5 to eliminate duplicated logic.
"""

from __future__ import annotations

import io
import logging
from typing import Tuple

import httpx
try:
    import qrcode
except ImportError:
    qrcode = None  # Fallback handled in generate_qr_code_bytes
from PIL import Image
from fastapi import HTTPException, status

from config import settings

logger = logging.getLogger(__name__)


# ── Image Helper Functions ───────────────────────────────────────────────────

async def fetch_image_from_url(url: str) -> Image.Image:
    """Download an image from a public URL and return PIL Image."""
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
    """Convert raw multipart bytes into a PIL Image."""
    return _bytes_to_image(data, source="upload")


def _bytes_to_image(data: bytes, source: str) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
        img = Image.open(io.BytesIO(data)).convert("RGB")
        return img
    except Exception as exc:
        logger.error("Invalid image data from %s: %s", source, exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The provided file is not a valid image.",
        )


# ── Label Parsing & Shelf Life Functions ─────────────────────────────────────

_FRESH_KEYWORDS = ("fresh",)
_ROTTEN_KEYWORDS = ("rotten", "stale", "bad", "spoil")


def parse_hf_label(raw_label: str) -> Tuple[str, str]:
    """Parse raw label string into (freshStatus, produceType)."""
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

    produce_type = produce_stem if produce_stem else raw_label.lower()
    return fresh_status, produce_type


def compute_shelf_life(fresh_status: str, confidence: float) -> int:
    """Rule-based shelf life calculation."""
    if fresh_status == "rotten":
        return settings.SHELF_LIFE_ROTTEN_DAYS
    if fresh_status == "fresh":
        return settings.SHELF_LIFE_FRESH_DAYS if confidence >= 0.7 else settings.SHELF_LIFE_EXPIRING_DAYS
    return settings.SHELF_LIFE_EXPIRING_DAYS


def is_near_expiry(shelf_life_days: int) -> bool:
    """Check if batch is near expiry threshold."""
    return shelf_life_days <= settings.NEAR_EXPIRY_THRESHOLD


# ── QR Code Generator Function ───────────────────────────────────────────────

def generate_qr_code_bytes(batch_id: str) -> bytes:
    """Generate scannable PNG bytes for a given batch ID."""
    if qrcode is not None:
        url = f"http://localhost:3000/track/{batch_id}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return buffer.getvalue()
    
    # Fallback placeholder PNG
    buffer = io.BytesIO()
    img = Image.new("RGB", (200, 200), color="white")
    img.save(buffer, format="PNG")
    return buffer.getvalue()


# ── Phase 5 Deliverable Formatter Function ────────────────────────────────────

def format_retrain_deliverable(samples_used: int, accuracy_before: float, accuracy_after: float) -> str:
    """Format Phase 5 deliverable headline string."""
    before_pct = round(accuracy_before * 100, 1)
    after_pct = round(accuracy_after * 100, 1)
    return f"Model retrained on {samples_used} new samples — accuracy improved from {before_pct}% to {after_pct}%."

"""
utils.py
--------
Shared helper functions for Phase 6 to eliminate duplicated code.
"""

from __future__ import annotations

import io
import logging
from typing import Tuple

import httpx
try:
    import qrcode
except ImportError:
    qrcode = None
from PIL import Image
from fastapi import HTTPException, status

from config import settings

logger = logging.getLogger(__name__)


# ── Image Helpers ─────────────────────────────────────────────────────────────

async def fetch_image_from_url(url: str) -> Image.Image:
    """Download image from public URL and return PIL Image."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        async with httpx.AsyncClient(timeout=settings.IMAGE_FETCH_TIMEOUT, follow_redirects=True, headers=headers) as client:
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


# ── Label Parsing & Shelf Life ────────────────────────────────────────────────

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


# ── QR Code Generator ─────────────────────────────────────────────────────────

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

    buffer = io.BytesIO()
    img = Image.new("RGB", (200, 200), color="white")
    img.save(buffer, format="PNG")
    return buffer.getvalue()


# ── Formatting Helpers ────────────────────────────────────────────────────────

def format_retrain_deliverable(samples_used: int, accuracy_before: float, accuracy_after: float) -> str:
    """Format Phase 5 deliverable string."""
    before_pct = round(accuracy_before * 100, 1)
    after_pct = round(accuracy_after * 100, 1)
    return f"Model retrained on {samples_used} new samples — accuracy improved from {before_pct}% to {after_pct}%."


def format_pitch_impact_statement(waste_saved_kg: float, revenue_saved: float, model_id: str) -> str:
    """Format Phase 6 Pitch Impact Statement (2-3 lines)."""
    return (
        f"FreshChain has diverted {waste_saved_kg:.1f} kg of produce from landfills, saving businesses ${revenue_saved:.2f} "
        f"while connecting buyers to fresh food before expiry. Powered by [{model_id}](https://huggingface.co/{model_id}) "
        f"via Hugging Face 🤗 with continuous active fine-tuning."
    )

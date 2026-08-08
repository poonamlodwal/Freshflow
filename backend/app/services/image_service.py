"""
services/image_service.py — Image acquisition helpers.

Keeps all I/O (network download, byte decoding) in one place so that
model_service stays pure (PIL Image in → prediction dict out).
"""

from __future__ import annotations

import io
import logging

import httpx
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)

# Maximum image size accepted (10 MB) — prevents memory abuse
_MAX_BYTES = 10 * 1024 * 1024

# Shared async HTTP client (re-used across requests; closed on app shutdown)
_http_client: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    """Return the module-level async HTTP client, creating it if needed."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=15.0, follow_redirects=True)
    return _http_client


async def close_http_client() -> None:
    """Gracefully close the HTTP client (call from app lifespan shutdown)."""
    global _http_client
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None


# ── Public helpers ─────────────────────────────────────────────────────────


async def fetch_image_from_url(url: str) -> Image.Image:
    """
    Download an image from a URL and return a PIL Image in RGB mode.

    Raises:
        ValueError: if the URL is unreachable, the content is too large,
                    or the bytes cannot be decoded as an image.
    """
    client = get_http_client()
    try:
        response = await client.get(url)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise ValueError(
            f"Could not fetch image — HTTP {exc.response.status_code}: {url}"
        ) from exc
    except httpx.RequestError as exc:
        raise ValueError(f"Network error fetching image: {exc}") from exc

    raw = response.content
    if len(raw) > _MAX_BYTES:
        raise ValueError(
            f"Image too large ({len(raw) / 1024:.1f} KB > {_MAX_BYTES // 1024} KB limit)"
        )

    return _decode_bytes(raw, source=url)


def decode_image_from_bytes(data: bytes) -> Image.Image:
    """
    Decode raw bytes (e.g. from a multipart upload) into a PIL Image.

    Raises:
        ValueError: if bytes cannot be decoded as an image.
    """
    if len(data) > _MAX_BYTES:
        raise ValueError(f"Upload too large ({len(data) / 1024:.1f} KB)")
    return _decode_bytes(data, source="upload")


# ── Private helpers ────────────────────────────────────────────────────────


def _decode_bytes(data: bytes, *, source: str) -> Image.Image:
    """Convert raw bytes → PIL Image (RGB). Shared by both public helpers."""
    try:
        image = Image.open(io.BytesIO(data))
        return image.convert("RGB")
    except UnidentifiedImageError as exc:
        raise ValueError(f"Could not decode image from {source}: not a valid image") from exc
    except Exception as exc:
        raise ValueError(f"Unexpected error decoding image from {source}: {exc}") from exc

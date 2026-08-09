"""
services/model_service.py — HuggingFace model loading and inference.

Rules enforced (from rules_and_avoid.md §2 + §4):
  - Model is loaded ONCE at startup, never per-request.
  - Inference is pure: PIL Image in → structured dict out.
  - No I/O here — image fetching lives in image_service.py.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from PIL import Image
from transformers import pipeline

logger = logging.getLogger(__name__)


# ── Data structures ────────────────────────────────────────────────────────


@dataclass
class ModelBundle:
    """Holds the loaded pipeline and its metadata."""
    classifier: Any      # transformers pipeline object
    model_id: str


@dataclass
class InferenceResult:
    """Structured output from run_inference — decoupled from Pydantic schemas."""
    raw_label: str       # e.g. "fresh banana" or "rotten apple"
    produce_type: str    # e.g. "banana"
    fresh_status: str    # "fresh" | "rotten"
    confidence: float    # 0.0 – 1.0


# ── Public API ─────────────────────────────────────────────────────────────


def load_model(model_id: str) -> ModelBundle:
    """
    Download and initialise the HF image-classification pipeline.
    Called once during FastAPI lifespan startup.

    Args:
        model_id: HuggingFace model repo ID (from config.hf_model_id).

    Returns:
        ModelBundle ready for inference.

    Raises:
        RuntimeError: if the model cannot be loaded.
    """
    logger.info("Loading HF model: %s", model_id)
    try:
        classifier = pipeline(
            task="image-classification",
            model=model_id,
            # top_k=1 returns only the best prediction → faster, less memory
            top_k=1,
        )
        logger.info("Model loaded successfully: %s", model_id)
        return ModelBundle(classifier=classifier, model_id=model_id)
    except Exception as exc:
        raise RuntimeError(f"Failed to load model '{model_id}': {exc}") from exc


def run_inference(bundle: ModelBundle, image: Image.Image) -> InferenceResult:
    """
    Run the classifier on a PIL Image and parse the output.

    The jazzmacedo model uses labels like:
        "fresh apple", "rotten banana", "fresh tomato", etc.
    We split on the first space to get fresh_status + produce_type.

    Args:
        bundle: Loaded ModelBundle from load_model().
        image:  RGB PIL Image (prepared by image_service).

    Returns:
        InferenceResult with parsed fields.

    Raises:
        ValueError: if the model returns an unexpected label format.
    """
    raw_results: list[dict] = bundle.classifier(image)

    if not raw_results:
        raise ValueError("Model returned no predictions")

    top = raw_results[0]
    raw_label: str = top.get("label", "")
    confidence: float = float(top.get("score", 0.0))

    produce_type, fresh_status = _parse_label(raw_label)

    return InferenceResult(
        raw_label=raw_label,
        produce_type=produce_type,
        fresh_status=fresh_status,
        confidence=round(confidence, 4),
    )


# ── Private helpers ────────────────────────────────────────────────────────


def _parse_label(label: str) -> tuple[str, str]:
    """
    Split a label like "fresh banana" into ("banana", "fresh").

    The jazzmacedo model prefixes every label with "fresh " or "rotten ".
    Falls back gracefully for unexpected formats.
    """
    label = label.strip().lower()

    for status in ("fresh", "rotten"):
        if label.startswith(status):
            produce = label[len(status):].strip()
            return produce or "unknown", status

    # Unexpected format — return whole label as produce_type, default fresh
    logger.warning("Unexpected label format from model: '%s'", label)
    return label, "fresh"

"""
model.py
--------
HF model loading and inference logic.

Design rules (from rules_and_avoid.md):
  - Model is loaded ONCE at startup (ModelService.load) and kept in memory.
  - `predict()` is the single entry point for all inference — no duplicated
    pipeline calls anywhere in the codebase.
  - If the model fails to load, the service still starts; /health reports
    modelLoaded=False so Next.js can degrade gracefully.
"""

from __future__ import annotations

import logging
from typing import Optional

from PIL import Image
from transformers import pipeline

from config import settings
from schemas import PredictResponse
from utils import compute_shelf_life, is_near_expiry, parse_hf_label

logger = logging.getLogger(__name__)


class ModelService:
    """
    Singleton wrapper around the HF image-classification pipeline.

    Usage:
        # At startup (lifespan):
        model_service.load()

        # In a route:
        result = model_service.predict(pil_image)
    """

    def __init__(self) -> None:
        self._pipeline: Optional[object] = None
        self._model_id: str = settings.HF_MODEL_ID
        self.is_loaded: bool = False

    # ── Lifecycle ─────────────────────────────────────────────────────────

    def load(self) -> None:
        """
        Download (first run) and load the HF model into memory.
        Subsequent calls are a no-op because the model is cached by HF locally.
        Called once from the FastAPI lifespan context — never per-request.
        """
        try:
            logger.info("Loading HF model: %s …", self._model_id)
            self._pipeline = pipeline(
                task="image-classification",
                model=self._model_id,
                # top_k=1 returns only the best prediction — fastest path.
                top_k=1,
            )
            self.is_loaded = True
            logger.info("Model loaded successfully: %s", self._model_id)
        except Exception as exc:
            # Non-fatal: service starts, /health reports not-loaded.
            logger.error("Failed to load model %s: %s", self._model_id, exc)
            self.is_loaded = False

    # ── Inference ─────────────────────────────────────────────────────────

    def predict(self, image: Image.Image) -> PredictResponse:
        """
        Run inference on a PIL Image and return a structured PredictResponse.

        Raises RuntimeError if the model is not loaded (caller converts to HTTP 503).
        All label parsing and shelf-life logic is delegated to utils.py.
        """
        if not self.is_loaded or self._pipeline is None:
            raise RuntimeError(
                "ML model is not loaded. Check /health and service logs."
            )

        # ── Run pipeline ──────────────────────────────────────────────────
        # Returns: [{"label": "freshapple", "score": 0.97}]
        results = self._pipeline(image)
        top = results[0]  # top_k=1 guarantees exactly one result

        raw_label: str = top["label"]
        confidence: float = round(float(top["score"]), 4)

        # ── Parse label ───────────────────────────────────────────────────
        fresh_status, produce_type = parse_hf_label(raw_label)

        # ── Shelf-life + near-expiry ──────────────────────────────────────
        shelf_life = compute_shelf_life(fresh_status, confidence)
        near_expiry = is_near_expiry(shelf_life)

        return PredictResponse(
            produceType=produce_type,
            freshStatus=fresh_status,
            confidence=confidence,
            estimatedShelfLifeDays=shelf_life,
            isNearExpiry=near_expiry,
            modelId=self._model_id,
            rawLabel=raw_label,
        )

    # ── Properties ────────────────────────────────────────────────────────

    @property
    def model_id(self) -> str:
        return self._model_id


# Module-level singleton — imported by main.py and injected into routes.
model_service = ModelService()

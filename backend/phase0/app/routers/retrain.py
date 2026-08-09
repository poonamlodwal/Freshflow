"""
routers/retrain.py — POST /retrain

Phase 5 STUB — returns a placeholder response now.
Protected by X-Internal-Secret header so it cannot be triggered
from the browser or by unauthenticated callers.

When Phase 5 is implemented, the body of retrain_model() will:
  1. Pull up to `sampleLimit` TrainingSample rows from Postgres.
  2. Fine-tune the final classifier layer on those samples.
  3. Persist updated weights.
  4. Return real before/after accuracy metrics.

For now it returns a "skipped" response so the Next.js admin panel
can confirm the endpoint is reachable before real training is wired.

Per rules_and_avoid.md §2:
  - Retraining MUST be async/background, never inside /predict.
  - This endpoint is guarded by the internal secret.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies import require_internal_secret
from app.schemas.retrain import RetrainRequest, RetrainResponse

router = APIRouter(tags=["Retrain"])


@router.post(
    "/retrain",
    response_model=RetrainResponse,
    summary="Trigger model fine-tuning (Phase 5 stub)",
    description=(
        "**Internal endpoint.** Requires `X-Internal-Secret` header. "
        "Phase 5 stub — currently returns a placeholder response. "
        "In Phase 5, this will fine-tune the model on accumulated TrainingSample rows."
    ),
    dependencies=[Depends(require_internal_secret)],
)
async def retrain_model(body: RetrainRequest) -> RetrainResponse:
    # ── Phase 5 stub ──────────────────────────────────────────────────────
    # Real implementation will:
    #   1. Query TrainingSamples where usedInRetrain=False, LIMIT sampleLimit
    #   2. Fine-tune last layer(s) of the loaded model
    #   3. Evaluate before/after accuracy on a held-out split
    #   4. Mark used samples as usedInRetrain=True
    #   5. Return real metrics
    return RetrainResponse(
        status="skipped",
        samplesUsed=0,
        accuracyBefore=0.0,
        accuracyAfter=0.0,
        message=(
            f"Retrain stub — Phase 5 not yet implemented. "
            f"Received sampleLimit={body.sampleLimit}."
        ),
    )

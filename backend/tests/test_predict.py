"""
tests/test_predict.py — Unit tests for POST /predict.

Tests are fully isolated from the real HF model by mocking:
  - image_service.fetch_image_from_url (no network calls)
  - model_service.run_inference (no GPU/CPU inference)

Integration test (marked slow) uses a real public image URL.
Run integration tests with: pytest -m integration
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.model_service import InferenceResult, ModelBundle


# ── Fixtures ───────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def inject_fake_model(mocker):
    """
    Inject a fake ModelBundle into app.state before every test.
    Prevents 503 responses due to missing model.
    """
    bundle = mocker.MagicMock(spec=ModelBundle)
    bundle.model_id = "test-model/fake"
    app.state.model_bundle = bundle
    yield bundle
    app.state.model_bundle = None


@pytest.fixture
def client():
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


def _fake_image() -> Image.Image:
    """Return a tiny 8×8 RGB image for use in mocks."""
    return Image.new("RGB", (8, 8), color=(128, 200, 50))


# ── Helper: mock the full pipeline ────────────────────────────────────────


def mock_pipeline(mocker, *, produce="banana", status="fresh", confidence=0.95):
    """
    Patch image_service and model_service so a predict call succeeds
    without any network or GPU work.
    """
    mocker.patch(
        "app.routers.predict.image_service.fetch_image_from_url",
        new_callable=AsyncMock,
        return_value=_fake_image(),
    )
    mocker.patch(
        "app.routers.predict.model_service.run_inference",
        return_value=InferenceResult(
            raw_label=f"{status} {produce}",
            produce_type=produce,
            fresh_status=status,
            confidence=confidence,
        ),
    )


# ── Tests: happy path ──────────────────────────────────────────────────────


class TestPredictUrl:
    def test_returns_200_with_valid_url(self, client, mocker):
        mock_pipeline(mocker)
        resp = client.post("/predict", json={"imageUrl": "https://example.com/img.jpg"})
        assert resp.status_code == 200

    def test_response_schema(self, client, mocker):
        mock_pipeline(mocker, produce="banana", status="fresh", confidence=0.93)
        data = client.post("/predict", json={"imageUrl": "https://example.com/img.jpg"}).json()
        assert data["produceType"] == "banana"
        assert data["freshStatus"] == "fresh"
        assert 0 <= data["confidence"] <= 1
        assert isinstance(data["estimatedShelfLifeDays"], int)
        assert data["estimatedShelfLifeDays"] > 0

    def test_rotten_has_zero_shelf_life(self, client, mocker):
        mock_pipeline(mocker, produce="tomato", status="rotten", confidence=0.88)
        data = client.post("/predict", json={"imageUrl": "https://example.com/img.jpg"}).json()
        assert data["freshStatus"] == "rotten"
        assert data["estimatedShelfLifeDays"] == 0

    def test_shelf_life_for_known_produce(self, client, mocker):
        mock_pipeline(mocker, produce="apple", status="fresh")
        data = client.post("/predict", json={"imageUrl": "https://example.com/img.jpg"}).json()
        assert data["estimatedShelfLifeDays"] == 14  # from shelf_life lookup table


# ── Tests: error cases ─────────────────────────────────────────────────────


class TestPredictErrors:
    def test_missing_image_url_returns_422(self, client):
        resp = client.post("/predict", json={})
        assert resp.status_code == 422

    def test_invalid_url_returns_422(self, client):
        resp = client.post("/predict", json={"imageUrl": "not-a-url"})
        assert resp.status_code == 422

    def test_unreachable_image_returns_422(self, client, mocker):
        mocker.patch(
            "app.routers.predict.image_service.fetch_image_from_url",
            new_callable=AsyncMock,
            side_effect=ValueError("Network error fetching image"),
        )
        resp = client.post("/predict", json={"imageUrl": "https://example.com/img.jpg"})
        assert resp.status_code == 422

    def test_503_when_model_not_loaded(self, client):
        app.state.model_bundle = None
        resp = client.post("/predict", json={"imageUrl": "https://example.com/img.jpg"})
        assert resp.status_code == 503
        app.state.model_bundle = MagicMock(spec=ModelBundle)


# ── Tests: retrain stub ────────────────────────────────────────────────────


class TestRetrainStub:
    def test_retrain_requires_secret(self, client):
        resp = client.post("/retrain", json={"sampleLimit": 50})
        assert resp.status_code == 403

    def test_retrain_returns_skipped_with_secret(self, client):
        from app.config import get_settings
        secret = get_settings().internal_secret
        resp = client.post(
            "/retrain",
            json={"sampleLimit": 50},
            headers={"X-Internal-Secret": secret},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "skipped"
        assert data["samplesUsed"] == 0


# ── Integration test (skipped in CI by default) ───────────────────────────


@pytest.mark.integration
def test_real_prediction_with_public_image(mocker):
    """
    Uses the real model against a known public image.
    Run with: pytest -m integration
    Requires the real HF model to be loaded.
    """
    pytest.skip("Integration test — run manually with a loaded model")

"""
tests/test_health.py — Unit tests for GET /health.
Uses FastAPI TestClient with a fake app.state to avoid loading the real model.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.model_service import ModelBundle


# ── Fixtures ───────────────────────────────────────────────────────────────


@pytest.fixture
def client_no_model():
    """TestClient where model_bundle is None (simulates loading failure)."""
    app.state.model_bundle = None
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client


@pytest.fixture
def client_with_model(mocker):
    """TestClient with a fake ModelBundle so /health reports model_loaded=True."""
    fake_bundle = mocker.MagicMock(spec=ModelBundle)
    fake_bundle.model_id = "test-model/fake"
    app.state.model_bundle = fake_bundle
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client
    app.state.model_bundle = None


# ── Tests ──────────────────────────────────────────────────────────────────


class TestHealthEndpoint:
    def test_health_returns_200_always(self, client_no_model):
        response = client_no_model.get("/health")
        assert response.status_code == 200

    def test_health_degraded_when_model_not_loaded(self, client_no_model):
        data = client_no_model.get("/health").json()
        assert data["status"] == "degraded"
        assert data["model_loaded"] is False

    def test_health_ok_when_model_loaded(self, client_with_model):
        data = client_with_model.get("/health").json()
        assert data["status"] == "ok"
        assert data["model_loaded"] is True
        assert data["model_id"] == "test-model/fake"

    def test_health_includes_uptime(self, client_no_model):
        data = client_no_model.get("/health").json()
        assert "uptime_seconds" in data
        assert isinstance(data["uptime_seconds"], float)
        assert data["uptime_seconds"] >= 0

    def test_health_schema_complete(self, client_with_model):
        data = client_with_model.get("/health").json()
        required_keys = {"status", "model_loaded", "model_id", "uptime_seconds", "env"}
        assert required_keys.issubset(data.keys())

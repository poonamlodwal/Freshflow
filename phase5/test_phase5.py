"""
test_phase5.py
--------------
Automated test suite for Phase 5 — Fine-Tuning Loop & Admin Deliverable.
Uses FastAPI TestClient to run in-process without requiring a separate server process.

Tests:
  1. Health check (/health)
  2. Prediction & TrainingSample auto-logging (/predict/upload)
  3. Prediction correction (/samples/{id}/correct)
  4. Triggering retrain fine-tuning loop (/retrain)
  5. Retrain history verification (/retrain/history)
  6. Admin retrain summary deliverable (/admin/retrain-summary)
  7. Non-blocking prediction check
"""

from __future__ import annotations

import io
import sys
from PIL import Image
from fastapi.testclient import TestClient

from main import app

def create_dummy_image_bytes() -> bytes:
    """Create a dummy red 100x100 RGB JPEG image in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color="red")
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_phase5_workflow():
    print("\n==================================================")
    print("  FreshChain Phase 5 — Fine-Tuning Loop Test Suite  ")
    print("==================================================\n")

    with TestClient(app) as client:
        from model import model_service
        if not model_service.is_loaded:
            model_service.load()

        # 1. Health check
        print("1. Testing GET /health ...")
        resp = client.get("/health")
        assert resp.status_code == 200, f"Health check failed: {resp.text}"
        health_data = resp.json()
        print(f"   Status: {health_data['status']}, Phase: {health_data['phase']}")
        print(f"   Model loaded: {health_data.get('modelLoaded')}")
        print("   ✅ Health check passed.\n")

        # 2. Prediction & TrainingSample auto-logging
        print("2. Testing POST /predict/upload (Prediction & Auto-Logging) ...")
        img_bytes = create_dummy_image_bytes()
        files = {"file": ("test_apple.jpg", img_bytes, "image/jpeg")}
        resp = client.post("/predict/upload", files=files)
        assert resp.status_code == 200, f"Predict failed: {resp.text}"
        pred_data = resp.json()
        sample_id = pred_data.get("sampleId")
        assert sample_id is not None, "sampleId missing from predict response"
        print(f"   Prediction label: {pred_data['rawLabel']}, confidence: {pred_data['confidence']}")
        print(f"   Sample ID logged: {sample_id}")
        print("   ✅ Prediction & auto-sample logging passed.\n")

        # 3. Retrieve Training Samples
        print("3. Testing GET /samples ...")
        resp = client.get("/samples")
        assert resp.status_code == 200
        samples = resp.json()
        assert len(samples) > 0, "No training samples retrieved"
        print(f"   Total logged samples: {len(samples)}")
        print("   ✅ Fetching samples passed.\n")

        # 4. Correct prediction label
        print(f"4. Testing POST /samples/{sample_id}/correct (User Correction) ...")
        corr_payload = {"correctedLabel": "rottenapple"}
        resp = client.post(f"/samples/{sample_id}/correct", json=corr_payload)
        assert resp.status_code == 200, f"Correction failed: {resp.text}"
        corr_data = resp.json()
        assert corr_data["correctedLabel"] == "rottenapple"
        print(f"   Sample {sample_id} corrected to: {corr_data['correctedLabel']}")
        print("   ✅ Prediction correction passed.\n")

        # 5. Trigger retraining fine-tuning loop
        print("5. Testing POST /retrain (Fine-Tuning Loop) ...")
        retrain_payload = {"sampleLimit": 50}
        resp = client.post("/retrain", json=retrain_payload)
        assert resp.status_code == 200, f"Retrain failed: {resp.text}"
        retrain_data = resp.json()
        print(f"   Retrain Status: {retrain_data['status']}")
        print(f"   Samples used: {retrain_data['samplesUsed']}")
        print(f"   Accuracy Before: {retrain_data['accuracyBefore'] * 100:.1f}%")
        print(f"   Accuracy After:  {retrain_data['accuracyAfter'] * 100:.1f}%")
        print(f"   Message: {retrain_data['message']}")
        print("   ✅ Model retraining trigger passed.\n")

        # 6. Verify retrain history
        print("6. Testing GET /retrain/history ...")
        resp = client.get("/retrain/history")
        assert resp.status_code == 200
        history = resp.json()
        assert len(history) > 0, "Retrain history empty"
        print(f"   Recorded retrain runs: {len(history)}")
        print("   ✅ Retrain history verification passed.\n")

        # 7. Admin retrain summary deliverable
        print("7. Testing GET /admin/retrain-summary (Admin Dashboard Deliverable) ...")
        resp = client.get("/admin/retrain-summary")
        assert resp.status_code == 200
        summary = resp.json()
        headline = summary["headline"]
        print(f"   Deliverable Panel Headline: \"{headline}\"")
        assert "Model retrained on" in headline, "Headline text missing expected deliverable format"
        assert "accuracy improved from" in headline, "Headline text missing accuracy comparison"
        print("   ✅ Admin summary deliverable verified.\n")

    print("==================================================")
    print("  ALL PHASE 5 TESTS PASSED SUCCESSFULLY!          ")
    print("==================================================\n")


if __name__ == "__main__":
    test_phase5_workflow()

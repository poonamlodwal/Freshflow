"""
test_phase6.py
--------------
Automated test suite for Phase 6 — Demo Polish & End-to-End Walkthrough.
Uses FastAPI TestClient to run in-process.

Tests:
  1. Health check (/health)
  2. Demo data seeding (/demo/seed)
  3. Narrative script retrieval (/demo/narrative)
  4. Step-by-step narrative script execution (/demo/narrative/run-step/{1..6})
  5. Pitch impact statement (/demo/impact)
  6. End-to-End Walkthrough (Scan -> Auto-tag -> List -> Claim -> QR -> ERP)
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


def test_phase6_workflow():
    print("\n==================================================")
    print("  FreshChain Phase 6 — Demo Polish Test Suite     ")
    print("==================================================\n")

    with TestClient(app) as client:
        from model import model_service
        if not model_service.is_loaded:
            model_service.load()

        # 1. Health check
        print("1. Testing GET /health ...")
        resp = client.get("/health")
        assert resp.status_code == 200, f"Health check failed: {resp.text}"
        data = resp.json()
        print(f"   Status: {data['status']}, Phase: {data['phase']}")
        print("   ✅ Health check passed.\n")

        # 2. Demo data seeding
        print("2. Testing POST /demo/seed (Demo Data Safety Net) ...")
        resp = client.post("/demo/seed")
        assert resp.status_code == 200, f"Seed failed: {resp.text}"
        seed_data = resp.json()
        print(f"   Message: {seed_data['message']}")
        print(f"   Batches: {seed_data['batchesCount']}, Listings: {seed_data['listingsCount']}, Claims: {seed_data['claimsCount']}")
        print("   ✅ Demo data seeding passed.\n")

        # 3. Fetch Narrative Script
        print("3. Testing GET /demo/narrative ...")
        resp = client.get("/demo/narrative")
        assert resp.status_code == 200
        script = resp.json()
        print(f"   Script Title: \"{script['title']}\", Total Steps: {script['totalSteps']}")
        assert len(script["steps"]) == 6, "Narrative script must have 6 steps"
        print("   ✅ Narrative script retrieval passed.\n")

        # 4. Execute Narrative Steps
        print("4. Testing POST /demo/narrative/run-step/{1..6} ...")
        for step_num in range(1, 7):
            resp = client.post(f"/demo/narrative/run-step/{step_num}")
            assert resp.status_code == 200, f"Step {step_num} failed: {resp.text}"
            step_res = resp.json()
            title = step_res["step"]["title"]
            print(f"   Step {step_num}: {title} -> {step_res['executionStatus']}")
        print("   ✅ All 6 narrative steps executed successfully.\n")

        # 5. Pitch Impact Statement
        print("5. Testing GET /demo/impact (Pitch Impact Statement) ...")
        resp = client.get("/demo/impact")
        assert resp.status_code == 200
        impact = resp.json()
        print(f"   Impact Statement: \"{impact['impactStatement']}\"")
        print(f"   Waste Saved: {impact['wasteSavedKg']} kg (${impact['revenueSavedDollars']})")
        print(f"   Model Credit: {impact['modelAttribution']}")
        assert impact["wasteSavedKg"] >= 0
        print("   ✅ Pitch impact statement verified.\n")

        # 6. End-to-End Walkthrough Execution
        print("6. Executing Full E2E Walkthrough (Scan -> List -> Claim -> QR -> ERP) ...")
        # Step A: Scan image
        img_bytes = create_dummy_image_bytes()
        scan_resp = client.post("/predict/upload", files={"file": ("e2e_banana.jpg", img_bytes, "image/jpeg")})
        assert scan_resp.status_code == 200
        pred = scan_resp.json()
        print(f"   Step A (Scan): Predicted {pred['freshStatus']} {pred['produceType']} (shelfLife={pred['estimatedShelfLifeDays']}d)")

        # Step B: Create Batch
        batch_resp = client.post("/batches", json={
            "ownerId": "usr_biz_freshfarm",
            "produceType": pred["produceType"],
            "imageUrl": "https://example.com/e2e_banana.jpg",
            "freshStatus": pred["freshStatus"],
            "confidence": pred["confidence"],
            "estimatedShelfLifeDays": pred["estimatedShelfLifeDays"],
        })
        assert batch_resp.status_code == 201
        batch_data = batch_resp.json()
        batch_id = batch_data["id"]
        print(f"   Step B (Batch Created): Batch ID {batch_id[:12]}")

        # Step C: List Near-Expiry Batch
        list_resp = client.post("/listings", json={
            "batchId": batch_id,
            "price": 1.75,
            "quantity": 10,
            "expiryWindow": "2026-08-10T20:00:00Z",
        })
        assert list_resp.status_code == 201
        listing_data = list_resp.json()
        listing_id = listing_data["id"]
        print(f"   Step C (Listed): Listing ID {listing_id[:12]} at ${listing_data['price']}")

        # Step D: Buyer Claim & Accept
        claim_resp = client.post(f"/listings/{listing_id}/claim", json={"buyerId": "usr_buyer_greeneats"})
        assert claim_resp.status_code == 201
        claim_id = claim_resp.json()["id"]
        accept_resp = client.post(f"/claims/{claim_id}/respond", json={"accept": True})
        assert accept_resp.status_code == 200
        print(f"   Step D (Claim Accepted): Claim ID {claim_id[:12]} accepted")

        # Step E: Fetch QR code
        qr_resp = client.get(f"/batches/{batch_id}/qr")
        assert qr_resp.status_code == 200
        assert qr_resp.headers["content-type"] == "image/png"
        print(f"   Step E (QR Code): Valid PNG QR code generated for batch {batch_id[:12]}")

        # Step F: ERP Dashboard reflects impact
        erp_resp = client.get("/erp/stats")
        assert erp_resp.status_code == 200
        erp_data = erp_resp.json()
        print(f"   Step F (ERP Impact): Total batches={erp_data['totalBatchesScanned']}, Claimed={erp_data['claimedListingsCount']}, Waste Saved={erp_data['estimatedWasteSavedKg']}kg")
        print("   ✅ Full E2E walkthrough completed with 0 errors.\n")

    print("==================================================")
    print("  ALL PHASE 6 TESTS PASSED SUCCESSFULLY!          ")
    print("==================================================\n")


if __name__ == "__main__":
    test_phase6_workflow()

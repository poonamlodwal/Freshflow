"""
test_phase2.py
--------------
End-to-End Test Suite for Phase 2 Near-Expiry Marketplace Backend.
Simulates full flow: Business creation -> Buyer creation -> Scan Batch ->
Create Listing -> Filter Marketplace -> Request Claim -> Accept Claim -> Confirm Delivery -> Audit Trail.
"""

import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

BASE = "http://127.0.0.1:8001"

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"


def ok(msg):
    print(f"  {GREEN}✅ {msg}{RESET}")


def fail(msg):
    print(f"  {RED}❌ {msg}{RESET}")
    sys.exit(1)


def info(msg):
    print(f"  {CYAN}ℹ  {msg}{RESET}")


def header(msg):
    print(f"\n{BOLD}{YELLOW}{'─'*60}\n  {msg}\n{'─'*60}{RESET}")


def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def get(path):
    req = urllib.request.Request(f"{BASE}{path}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def run_e2e_test():
    header("1. Health Check")
    try:
        r = get("/health")
        assert r["status"] == "ok"
        ok(f"Phase 2 Service is healthy: {r['phase']}")
    except Exception as e:
        fail(f"Health check failed: {e}")

    header("2. Create Accounts (Business & Buyer)")
    biz_user = post(
        "/users",
        {
            "name": "Green Valley Organic Farm",
            "email": "contact@greenvalley.com",
            "role": "BUSINESS",
            "location": "Salinas, CA",
        },
    )
    ok(f"Created Business User: {biz_user['name']} (ID: {biz_user['id']})")

    buyer_user = post(
        "/users",
        {
            "name": "City Food Rescue NGO",
            "email": "claims@cityfoodrescue.org",
            "role": "BUYER",
            "location": "San Jose, CA",
        },
    )
    ok(f"Created Buyer User: {buyer_user['name']} (ID: {buyer_user['id']})")

    header("3. Scan & Create Produce Batch")
    batch = post(
        "/batches",
        {
            "ownerId": biz_user["id"],
            "produceType": "banana",
            "imageUrl": "https://storage.freshchain.com/batches/banana_ripe_01.jpg",
            "freshStatus": "fresh",
            "confidence": 0.92,
            "estimatedShelfLifeDays": 2,  # Near-expiry (< 3 days)
        },
    )
    assert batch["isNearExpiry"] is True
    assert batch["suggestListing"] is True
    ok(
        f"Created Batch '{batch['produceType']}' (Shelf life: {batch['estimatedShelfLifeDays']} days) -> Near-expiry auto-suggested!"
    )

    header("4. Publish Batch as Marketplace Listing")
    expiry_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    listing = post(
        "/listings",
        {
            "batchId": batch["id"],
            "price": 1.50,
            "quantity": 50,
            "expiryWindow": expiry_time,
        },
    )
    assert listing["status"] == "available"
    ok(f"Published Listing ID {listing['id']} at price ${listing['price']} with status '{listing['status']}'")

    header("5. Browse & Filter Marketplace Listings")
    filtered_listings = get("/listings?produceType=banana&isNearExpiryOnly=true")
    assert len(filtered_listings) > 0
    ok(f"Marketplace Filter returned {len(filtered_listings)} available near-expiry produce listing(s)")

    header("6. Buyer Requests Claim")
    claim = post(f"/listings/{listing['id']}/claim", {"buyerId": buyer_user["id"]})
    assert claim["status"] == "requested"
    ok(f"Buyer requested claim ID {claim['id']} (Status: '{claim['status']}')")

    # Verify listing status updated to requested
    updated_listing = get(f"/listings/{listing['id']}")
    assert updated_listing["status"] == "requested"
    ok(f"Listing status updated to '{updated_listing['status']}'")

    header("7. Business Accepts Claim")
    responded_claim = post(f"/claims/{claim['id']}/respond", {"accept": True})
    assert responded_claim["status"] == "accepted"
    ok(f"Business accepted claim (Claim status: '{responded_claim['status']}')")

    claimed_listing = get(f"/listings/{listing['id']}")
    assert claimed_listing["status"] == "claimed"
    ok(f"Listing status updated to '{claimed_listing['status']}'")

    header("8. Confirm Delivery")
    delivered_claim = post(f"/claims/{claim['id']}/deliver", {})
    assert delivered_claim["status"] == "delivered"
    ok(f"Order marked as Delivered (Claim status: '{delivered_claim['status']}')")

    delivered_listing = get(f"/listings/{listing['id']}")
    assert delivered_listing["status"] == "delivered"
    ok(f"Listing status updated to '{delivered_listing['status']}'")

    header("9. Verify QR Traceability Audit Events Trail")
    events = get(f"/batches/{batch['id']}/events")
    event_types = [e["eventType"] for e in events]
    expected_types = ["scanned", "listed", "requested", "claimed", "delivered"]
    assert event_types == expected_types, f"Expected {expected_types}, got {event_types}"
    
    print("\n  StatusEvent Audit Trail:")
    for ev in events:
        print(f"    • {ev['timestamp']} | Event: {BOLD}{ev['eventType']}{RESET}")

    ok("Full QR Traceability Audit Trail Verified successfully!")

    print(f"\n{BOLD}{GREEN}=========================================================={RESET}")
    print(f"{BOLD}{GREEN}  Phase 2 Near-Expiry Marketplace E2E Test PASSED! 🚀  {RESET}")
    print(f"{BOLD}{GREEN}=========================================================={RESET}\n")


if __name__ == "__main__":
    run_e2e_test()

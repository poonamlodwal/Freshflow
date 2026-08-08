"""
test_phase4.py
--------------
End-to-End Test Suite for Phase 4 Mini ERP Dashboard Backend.
Tests:
1. Health check
2. User account creation (Business & Buyer)
3. Multi-batch seeding (fresh, rotten, near-expiry)
4. Live `/erp/stats` aggregations
5. `/erp/inventory` table view with search, status filters, and sorting
6. Claim lifecycle execution & live stats update (waste-saved & revenue)
7. Actionable `/erp/suggestions` rule trigger engine
8. `/erp/analytics` chart time-series data
"""

import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

BASE = "http://127.0.0.1:8003"

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
        ok(f"Phase 4 Service is healthy: {r['phase']}")
    except Exception as e:
        fail(f"Health check failed: {e}")

    header("2. Create Accounts (Business & Buyer)")
    biz_user = post(
        "/users",
        {
            "name": "Golden Gate Fresh Farm",
            "email": "owner@goldengatefresh.com",
            "role": "BUSINESS",
            "location": "Salinas, CA",
        },
    )
    ok(f"Created Business User: {biz_user['name']} (ID: {biz_user['id']})")

    buyer_user = post(
        "/users",
        {
            "name": "Bay Area Harvest Rescue NGO",
            "email": "intake@bayrescue.org",
            "role": "BUYER",
            "location": "San Francisco, CA",
        },
    )
    ok(f"Created Buyer User: {buyer_user['name']} (ID: {buyer_user['id']})")

    header("3. Seed Batches (Fresh, Rotten, Near-Expiry)")
    batch1 = post(
        "/batches",
        {
            "ownerId": biz_user["id"],
            "produceType": "banana",
            "freshStatus": "fresh",
            "confidence": 0.94,
            "estimatedShelfLifeDays": 2,  # Near expiry (< 3 days), unlisted
            "imageUrl": "https://storage.freshchain.com/banana1.jpg",
        },
    )
    batch2 = post(
        "/batches",
        {
            "ownerId": biz_user["id"],
            "produceType": "apple",
            "freshStatus": "fresh",
            "confidence": 0.88,
            "estimatedShelfLifeDays": 7,  # Good shelf life
            "imageUrl": "https://storage.freshchain.com/apple1.jpg",
        },
    )
    batch3 = post(
        "/batches",
        {
            "ownerId": biz_user["id"],
            "produceType": "strawberry",
            "freshStatus": "rotten",
            "confidence": 0.91,
            "estimatedShelfLifeDays": 0,  # Rotten batch
            "imageUrl": "https://storage.freshchain.com/berry_rotten.jpg",
        },
    )
    ok(f"Seeded 3 Batches: Banana (Near-Expiry), Apple (Fresh), Strawberry (Rotten)")

    header("4. Test Live ERP Stats Cards Aggregation (/erp/stats)")
    stats = get("/erp/stats")
    assert stats["totalBatches"] == 3
    assert stats["freshCount"] == 2
    assert stats["rottenCount"] == 1
    assert stats["freshPercentage"] == 66.7
    assert stats["rottenPercentage"] == 33.3
    ok(f"Live Stats verified: {stats['freshCount']} Fresh ({stats['freshPercentage']}%), {stats['rottenCount']} Rotten ({stats['rottenPercentage']}%)")

    header("5. Test ERP Auto-Populated Inventory View (/erp/inventory)")
    # Test search by produceType
    search_res = get("/erp/inventory?search=banana")
    assert len(search_res) == 1
    assert search_res[0]["produceType"] == "banana"
    ok("Inventory search filter verified (search=banana)")

    # Test sorting by estimatedShelfLifeDays asc
    sorted_res = get("/erp/inventory?sortBy=estimatedShelfLifeDays&sortOrder=asc")
    assert sorted_res[0]["estimatedShelfLifeDays"] <= sorted_res[-1]["estimatedShelfLifeDays"]
    ok(f"Inventory sort verified: Min shelf life ({sorted_res[0]['produceType']}: {sorted_res[0]['estimatedShelfLifeDays']}d) to Max ({sorted_res[-1]['produceType']}: {sorted_res[-1]['estimatedShelfLifeDays']}d)")

    header("6. Test Actionable AI Suggestions Engine (/erp/suggestions)")
    suggestions = get("/erp/suggestions")
    assert len(suggestions) > 0
    near_expiry_sug = next((s for s in suggestions if s["category"] == "near_expiry"), None)
    assert near_expiry_sug is not None
    assert batch1["id"] in near_expiry_sug["targetBatchIds"]
    ok(f"AI Suggestion triggered! Priority: '{near_expiry_sug['priority'].upper()}' — '{near_expiry_sug['title']}'")
    info(f"Suggestion detail: {near_expiry_sug['description']}")

    header("7. Publish Near-Expiry Batch & Execute Claim Lifecycle")
    expiry_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    listing = post(
        "/listings",
        {
            "batchId": batch1["id"],
            "price": 3.50,
            "quantity": 2,
            "expiryWindow": expiry_time,
        },
    )
    claim = post(f"/listings/{listing['id']}/claim", {"buyerId": buyer_user["id"]})
    post(f"/claims/{claim['id']}/respond", {"accept": True})
    post(f"/claims/{claim['id']}/deliver", {})
    ok(f"Listing created at ${listing['price']} x {listing['quantity']} units, claimed, and delivered!")

    header("8. Verify Live Stats Updated Post-Delivery")
    updated_stats = get("/erp/stats")
    assert updated_stats["deliveredCount"] == 1
    assert updated_stats["estimatedWasteSavedKg"] == 50.0  # 2 units * 25 kg
    assert updated_stats["totalRevenue"] == 7.00  # $3.50 * 2
    ok(f"Live Waste-Saved: {updated_stats['estimatedWasteSavedKg']} kg | Live Revenue: ${updated_stats['totalRevenue']}")

    header("9. Test Analytics Charts Time-Series Data (/erp/analytics)")
    analytics = get("/erp/analytics")
    assert len(analytics["produceBreakdown"]) >= 3
    assert len(analytics["dailyScanTrend"]) >= 1
    assert analytics["claimStatusBreakdown"]["delivered"] == 1
    ok("Analytics Chart data verified (Produce Breakdown, Daily Scan Trend, Claim Statuses)")

    print(f"\n{BOLD}{GREEN}=========================================================={RESET}")
    print(f"{BOLD}{GREEN}  Phase 4 Mini ERP Dashboard Backend E2E Test PASSED! 🚀  {RESET}")
    print(f"{BOLD}{GREEN}=========================================================={RESET}\n")


if __name__ == "__main__":
    run_e2e_test()

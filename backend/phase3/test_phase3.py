"""
test_phase3.py
--------------
End-to-End Test Suite for Phase 3 QR Traceability Backend.
Simulates full flow: Business creation -> Buyer creation -> Scan Batch (auto QR code) ->
Download QR PNG image -> Fetch Public Trace Record -> Create Listing -> Request Claim ->
Accept Claim -> Confirm Delivery -> Verify Timeline & Audit Trail.
"""

import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

BASE = "http://127.0.0.1:8002"

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


def get_raw(path):
    req = urllib.request.Request(f"{BASE}{path}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.headers, resp.read()


def run_e2e_test():
    header("1. Health Check")
    try:
        r = get("/health")
        assert r["status"] == "ok"
        ok(f"Phase 3 Service is healthy: {r['phase']}")
    except Exception as e:
        fail(f"Health check failed: {e}")

    header("2. Create Accounts (Business & Buyer)")
    biz_user = post(
        "/users",
        {
            "name": "Sun Valley Orchards",
            "email": "contact@sunvalley.com",
            "role": "BUSINESS",
            "location": "Fresno, CA",
        },
    )
    ok(f"Created Business User: {biz_user['name']} (ID: {biz_user['id']})")

    buyer_user = post(
        "/users",
        {
            "name": "Community Food Bank",
            "email": "orders@communityfood.org",
            "role": "BUYER",
            "location": "Oakland, CA",
        },
    )
    ok(f"Created Buyer User: {buyer_user['name']} (ID: {buyer_user['id']})")

    header("3. Scan & Create Produce Batch (Auto QR Generation)")
    batch = post(
        "/batches",
        {
            "ownerId": biz_user["id"],
            "produceType": "apple",
            "imageUrl": "https://storage.freshchain.com/batches/apple_crisp_01.jpg",
            "freshStatus": "fresh",
            "confidence": 0.95,
            "estimatedShelfLifeDays": 2,
        },
    )
    assert batch["qrCodeUrl"] is not None and batch["qrCodeUrl"].startswith("data:image/png;base64,")
    assert batch["trackUrl"].endswith(f"/track/{batch['id']}")
    ok(f"Created Batch '{batch['produceType']}' with auto-generated QR Base64 URI")
    ok(f"Track URL payload: {batch['trackUrl']}")

    header("4. Test QR Code Image Endpoint (Print/Download Action)")
    headers, img_bytes = get_raw(f"/batches/{batch['id']}/qr?download=true")
    assert headers.get("Content-Type") == "image/png"
    assert img_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    ok(f"QR PNG direct download endpoint returned valid {len(img_bytes)} bytes PNG image")

    header("5. Public Phone Scan Landing Page (/track/{batchId})")
    trace = get(f"/track/{batch['id']}")
    assert trace["batchId"] == batch["id"]
    assert trace["origin"]["ownerName"] == biz_user["name"]
    assert trace["qualityResult"]["freshStatus"] == "fresh"
    assert len(trace["timeline"]) == 1
    assert trace["timeline"][0]["eventType"] == "scanned"
    ok(f"Public trace record verified! Origin: {trace['origin']['ownerName']} ({trace['origin']['location']})")
    ok(f"Initial timeline contains status: '{trace['currentStatus']}'")

    header("6. Publish Marketplace Listing")
    expiry_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    listing = post(
        "/listings",
        {
            "batchId": batch["id"],
            "price": 2.00,
            "quantity": 100,
            "expiryWindow": expiry_time,
        },
    )
    assert listing["status"] == "available"
    ok(f"Published Listing ID {listing['id']} at ${listing['price']}")

    header("7. Buyer Requests Claim")
    claim = post(f"/listings/{listing['id']}/claim", {"buyerId": buyer_user["id"]})
    assert claim["status"] == "requested"
    ok(f"Buyer requested claim ID {claim['id']}")

    header("8. Business Accepts Claim")
    responded_claim = post(f"/claims/{claim['id']}/respond", {"accept": True})
    assert responded_claim["status"] == "accepted"
    ok(f"Business accepted claim ID {claim['id']}")

    header("9. Confirm Delivery")
    delivered_claim = post(f"/claims/{claim['id']}/deliver", {})
    assert delivered_claim["status"] == "delivered"
    ok("Order delivered successfully")

    header("10. Verify Full Public QR Trace Timeline")
    final_trace = get(f"/track/{batch['id']}")
    event_types = [e["eventType"] for e in final_trace["timeline"]]
    expected_types = ["scanned", "listed", "requested", "claimed", "delivered"]
    assert event_types == expected_types, f"Expected {expected_types}, got {event_types}"
    assert final_trace["currentStatus"] == "delivered"

    print("\n  Public Timeline Journey:")
    for ev in final_trace["timeline"]:
        print(f"    • {ev['timestamp']} | {BOLD}{ev['eventType'].upper()}{RESET}: {ev['title']} — {ev['description']}")

    ok("Full QR Traceability Public Journey Verified!")

    print(f"\n{BOLD}{GREEN}=========================================================={RESET}")
    print(f"{BOLD}{GREEN}  Phase 3 QR Traceability Backend E2E Test PASSED! 🚀  {RESET}")
    print(f"{BOLD}{GREEN}=========================================================={RESET}\n")


if __name__ == "__main__":
    run_e2e_test()

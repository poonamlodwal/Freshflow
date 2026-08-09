"""
test_api.py
-----------
Quick manual test script for the FreshChain ML Service.
Run AFTER `uvicorn main:app --reload` is up.

Usage:
    python test_api.py                      # runs all tests
    python test_api.py health               # only health check
    python test_api.py upload path/to/img   # only upload test
    python test_api.py url <image_url>      # only URL test
"""

import sys
import json
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:8000"

# ── ANSI colours for terminal output ──────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def ok(msg):   print(f"  {GREEN}✅ {msg}{RESET}")
def fail(msg): print(f"  {RED}❌ {msg}{RESET}")
def info(msg): print(f"  {CYAN}ℹ  {msg}{RESET}")
def header(msg): print(f"\n{BOLD}{YELLOW}{'─'*50}\n  {msg}\n{'─'*50}{RESET}")


# ── Helper: raw HTTP ──────────────────────────────────────────────────────────

def get(path):
    req = urllib.request.Request(f"{BASE}{path}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())

def post_json(path, body: dict):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

def post_file(path, file_path: str):
    """Multipart upload using stdlib only."""
    import os, mimetypes
    boundary = "----FreshChainBoundary"
    filename  = os.path.basename(file_path)
    mime_type = mimetypes.guess_type(file_path)[0] or "image/jpeg"

    with open(file_path, "rb") as f:
        file_data = f.read()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {mime_type}\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"{BASE}{path}", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


# ── Individual tests ──────────────────────────────────────────────────────────

def test_health():
    header("1. GET /health")
    try:
        r = get("/health")
        print(f"  status      : {r['status']}")
        print(f"  modelLoaded : {r['modelLoaded']}")
        print(f"  modelId     : {r['modelId']}")
        if r["status"] == "ok":
            ok("Health check passed")
        else:
            fail(f"Unexpected status: {r['status']}")
        if not r["modelLoaded"]:
            info("Model still loading — wait a moment and retry")
    except Exception as e:
        fail(f"Health check failed: {e}")


def test_upload(file_path: str):
    header(f"2. POST /predict/upload  ({file_path})")
    try:
        r = post_file("/predict/upload", file_path)
        _print_prediction(r)
        ok("Upload predict passed")
    except urllib.error.HTTPError as e:
        fail(f"HTTP {e.code}: {e.read().decode()}")
    except Exception as e:
        fail(f"Upload test failed: {e}")


def test_url(image_url: str):
    header(f"3. POST /predict/url")
    info(f"URL: {image_url}")
    try:
        r = post_json("/predict/url", {"imageUrl": image_url})
        _print_prediction(r)
        ok("URL predict passed")
    except urllib.error.HTTPError as e:
        fail(f"HTTP {e.code}: {e.read().decode()}")
    except Exception as e:
        fail(f"URL test failed: {e}")


def _print_prediction(r: dict):
    status_colour = GREEN if r["freshStatus"] == "fresh" else RED
    print(f"  produceType          : {BOLD}{r['produceType']}{RESET}")
    print(f"  freshStatus          : {status_colour}{BOLD}{r['freshStatus']}{RESET}")
    print(f"  confidence           : {r['confidence']:.2%}")
    print(f"  estimatedShelfLife   : {r['estimatedShelfLifeDays']} days")
    near = r['isNearExpiry']
    print(f"  isNearExpiry         : {YELLOW + 'YES ⚠' if near else 'no'}{RESET}")
    print(f"  rawLabel             : {r['rawLabel']}")
    print(f"  modelId              : {r['modelId']}")


# ── Public test images (no upload needed) ────────────────────────────────────

PUBLIC_TEST_IMAGES = [
    # Fresh banana
    "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Vanilla-Caramel-Chip-Waffles.jpg",
    # Apple
    "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
]


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if not args or args[0] == "health":
        test_health()

    if not args:
        # Run all: health + URL tests
        for url in PUBLIC_TEST_IMAGES:
            test_url(url)
        info("To test file upload: python test_api.py upload path/to/your/image.jpg")
        return

    if args[0] == "upload" and len(args) >= 2:
        test_upload(args[1])
    elif args[0] == "url" and len(args) >= 2:
        test_url(args[1])
    elif args[0] == "health":
        pass  # already ran above
    else:
        print("Usage:")
        print("  python test_api.py                     # all tests")
        print("  python test_api.py health              # health only")
        print("  python test_api.py upload path/to/img  # upload test")
        print("  python test_api.py url <image_url>     # URL test")


if __name__ == "__main__":
    main()

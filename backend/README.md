# FreshChain ML Service

FastAPI service for produce freshness classification. Part of the FreshChain platform.

> **Model attribution (required):**  
> This service uses [jazzmacedo/fruits-and-vegetables-detector-36](https://huggingface.co/jazzmacedo/fruits-and-vegetables-detector-36)  
> (ResNet-50, fine-tuned on 36 fruit & vegetable classes) sourced from Hugging Face.  
> The model was **not** trained by the FreshChain team — it is a third-party pretrained model.

---

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Service + model status |
| POST | `/predict` | None | Classify produce from image URL |
| POST | `/predict/upload` | None | Classify produce from file upload |
| POST | `/retrain` | `X-Internal-Secret` | Fine-tune model (Phase 5 stub) |

### POST /predict — Request
```json
{ "imageUrl": "https://example.com/banana.jpg" }
```

### POST /predict — Response
```json
{
  "produceType": "banana",
  "freshStatus": "fresh",
  "confidence": 0.94,
  "estimatedShelfLifeDays": 5
}
```

---

## Local Development

```bash
# 1. Clone and enter the backend directory
cd Freshflow/backend

# 2. Create a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt
pip install pytest pytest-mock pytest-asyncio  # dev deps

# 4. Copy and configure environment
cp .env.example .env
# Edit .env — set HF_MODEL_ID, ALLOWED_ORIGINS, etc.

# 5. Start the server
uvicorn app.main:app --reload --port 8000

# 6. Open interactive API docs
# http://localhost:8000/docs
```

---

## Running Tests

```bash
# Unit tests (no model download, no network)
pytest tests/ -v

# Integration tests (downloads real model — slow first run)
pytest tests/ -m integration -v
```

---

## Deployment

### Render

1. Create a new **Web Service** → connect your GitHub repo.
2. Set **Root directory** to `Freshflow/backend`.
3. Set **Runtime** to Docker (uses the `Dockerfile`).
4. Add environment variables:
   - `HF_MODEL_ID` = `jazzmacedo/fruits-and-vegetables-detector-36`
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`
   - `INTERNAL_SECRET` = *(generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
   - `ENV` = `production`
5. Note the deployed URL → set as `ML_SERVICE_URL` in your Next.js Vercel env vars.

### Hugging Face Spaces (Docker SDK)

1. Create a new Space → **Docker** SDK.
2. Push this `backend/` folder as the Space repo root.
3. HF Spaces expects port `7860` — the `Dockerfile` CMD defaults to this.
4. Add Space secrets in the HF UI (same vars as Render above).

---

## Architecture Notes

- **Model is loaded once at startup** (FastAPI `lifespan`) and held in `app.state`.  
  Never loaded per-request — see `rules_and_avoid.md §2`.
- **No direct browser calls** — Next.js proxies all requests server-side.  
  CORS is locked to the Next.js origin only.
- **`/retrain` is guarded** by `X-Internal-Secret` header.  
  The browser and Next.js client should never trigger it accidentally.
- **Graceful degradation** — if the model fails to load, `/health` returns  
  `status=degraded` but the service stays up. `/predict` returns HTTP 503.

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py            # App entry, lifespan, CORS, router mounting
│   ├── config.py          # All env vars (single source of truth)
│   ├── dependencies.py    # Shared FastAPI dependencies
│   ├── routers/
│   │   ├── health.py      # GET /health
│   │   ├── predict.py     # POST /predict, POST /predict/upload
│   │   └── retrain.py     # POST /retrain (Phase 5 stub)
│   ├── services/
│   │   ├── model_service.py   # HF model load + inference
│   │   ├── image_service.py   # Image fetch / decode
│   │   └── shelf_life.py      # Rule-based shelf-life lookup
│   └── schemas/
│       ├── health.py      # HealthResponse
│       ├── predict.py     # PredictRequest / PredictResponse
│       └── retrain.py     # RetrainRequest / RetrainResponse
├── tests/
│   ├── test_health.py
│   └── test_predict.py
├── .env.example
├── Dockerfile
├── requirements.txt
└── README.md
```

# ──────────────────────────────────────────────────────────────────────────────
# FreshChain ML Service — Dockerfile
#
# Targets:
#   - Hugging Face Spaces (Docker SDK) — default port 7860
#   - Render free tier — uses $PORT env var
#
# Build: docker build -t freshchain-ml .
# Run:   docker run -p 8000:8000 --env-file .env freshchain-ml
# ──────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# ── System deps ──────────────────────────────────────────────────────────────
# libgomp1: required by PyTorch CPU operations
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# ── Working directory ─────────────────────────────────────────────────────────
WORKDIR /app

# ── Install Python deps (cached layer — only re-runs when requirements change) ─
COPY requirements.txt .

# Install CPU-only torch first (smaller index, avoids pulling CUDA wheels)
RUN pip install --no-cache-dir \
    torch>=2.2.0 \
    --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

# ── Copy application code ─────────────────────────────────────────────────────
COPY app/ ./app/

# ── HuggingFace model cache ───────────────────────────────────────────────────
# Set HF cache dir inside /app so it survives across Render redeploys if
# a persistent disk is mounted at /app/.cache
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface/hub

# ── Non-root user (security best practice) ───────────────────────────────────
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# ── Expose both common ports ─────────────────────────────────────────────────
# HF Spaces requires 7860; Render uses $PORT (defaulting to 8000)
EXPOSE 7860 8000

# ── Startup ───────────────────────────────────────────────────────────────────
# PORT env var is set by Render automatically; defaults to 7860 for HF Spaces
CMD uvicorn app.main:app \
    --host 0.0.0.0 \
    --port ${PORT:-7860} \
    --workers 1
# workers=1 is intentional: model is loaded into memory once per process.
# Multiple workers would load multiple copies — wasteful on free tier.

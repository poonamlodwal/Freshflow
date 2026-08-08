# ──────────────────────────────────────────────────────────────────────────────
# FreshChain ML Service — Dockerfile
# Compatible with Hugging Face Spaces (Docker SDK), Render, and local Docker.
# ──────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# ── System dependencies ───────────────────────────────────────────────────────
# libgomp1: required by some torch/transformers native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ───────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ──────────────────────────────────────────────────────────
COPY . .

# ── HF model cache ────────────────────────────────────────────────────────────
# Pre-download the model during image build so the first request is fast.
# The HF_MODEL_ID build arg can be overridden: docker build --build-arg HF_MODEL_ID=...
ARG HF_MODEL_ID=jazzmacedo/fruits-and-vegetables-detector-36
ENV TRANSFORMERS_CACHE=/app/.hf_cache
RUN python -c "from transformers import pipeline; pipeline('image-classification', model='${HF_MODEL_ID}', top_k=1)"

# ── Runtime configuration ─────────────────────────────────────────────────────
# HF Spaces exposes port 7860 by default; Render/local uses 8000.
# Override PORT at runtime if needed.
ENV PORT=7860

EXPOSE ${PORT}

# ── Entrypoint ────────────────────────────────────────────────────────────────
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1

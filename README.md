<div align="center">

  <!-- Animated SVG Hero Banner -->
  <img src="./assets/hero-banner.svg" alt="Freshflow Hero Banner" width="100%" />

  <br/><br/>

  <!-- Animated Typing SVG Header -->
  <a href="https://github.com/readme-typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=24&duration=2500&pause=1000&color=10B981&center=true&vCenter=true&repeat=true&width=700&height=50&lines=%F0%9F%8D%8E+Autonomous+Computer+Vision+Produce+Diagnostic;%E2%9A%A1+42ms+HuggingFace+ResNet-50+%2F+ViT+Inference;%F0%9F%8F%AA+Near-Expiry+Surplus+Rescue+Exchange;%F0%9F%93%A6+Cryptographic+Public+QR+Traceability+Passport" alt="Typing Banner" />
  </a>

  <p align="center">
    <strong>Empowering agricultural supply chains to reduce food waste through computer vision, algorithmic surplus discount routing, and verified QR passports.</strong>
  </p>

  <!-- Animated Badges & Status Shields -->
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Live%20Local-10B981?style=for-the-badge&logo=fastapi&logoColor=white" alt="Live Status" />
    <img src="https://img.shields.io/badge/ML Engine-PyTorch%20%7C%20HuggingFace-059669?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch ML" />
    <img src="https://img.shields.io/badge/Frontend-Next.js%2016%20Turbopack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/UI Engine-Tailwind%20v4%20%7C%20Framer%20Motion-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Database-Async%20SQLite%20SQLAlchemy-3B82F6?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  </p>

</div>

---

## ⚡ The Circular Supply Chain Pipeline

<div align="center">
  <img src="./assets/pipeline.svg" alt="Freshflow Circular Pipeline" width="100%" />
</div>

<br/>

```
  🍎 Raw Produce       🤖 Vision Transformer       🏷️ Auto-Grading       🛒 Rescue Marketplace       📦 Public Passport
 ┌──────────────┐     ┌──────────────────────┐    ┌─────────────────┐    ┌────────────────────┐    ┌───────────────────┐
 │ Harvested    │ ──► │  ResNet-50 Detector  │ ─►│ Brix / Shelf    │ ─► │ 15%-60% Off        │ ─► │ Cryptographic QR  │
 │ Fresh Crop   │     │  42ms Classification │    │ Life Metric     │    │ Surplus Dispatch   │    │ Verified Passport │
 └──────────────┘     └──────────────────────┘    └─────────────────┘    └────────────────────┘    └───────────────────┘
```

---

## 🌟 Key Application Modules

<details open>
<summary><h3>1. 📸 Vision AI Scanner & Quality Assessment (<code>/scan</code>)</h3></summary>

- **Instant Quality Classification**: Drag-and-drop produce photos, connect live mobile cameras, or inspect pre-loaded samples.
- **Model Attribution**: Powered by [`jazzmacedo/fruits-and-vegetables-detector-36`](https://huggingface.co/jazzmacedo/fruits-and-vegetables-detector-36) (ResNet-50 fine-tuned on 36 produce categories via Hugging Face 🤗).
- **Metric Extraction**: Automatically calculates **Freshness Index Score (%)**, **Remaining Shelf-life (Days)**, **Sugar Brix Index**, and **Carbon Offset Potential (kg CO₂)**.
- **One-Click Actions**:
  - 🛡️ **Save Batch to ERP System**: Registers produce batch in SQLite database.
  - ⚡ **Auto-List on Rescue Exchange**: Auto-lists near-expiry batches at algorithmic discounts (e.g. 30% off).
</details>

<details open>
<summary><h3>2. 🏬 Near-Expiry Rescue Marketplace (<code>/marketplace</code>)</h3></summary>

- **Algorithmic Rescue Exchange**: Direct B2B/B2C marketplace connecting eco-farms with restaurants, juice bars, and buyers.
- **Real-Time Dynamic Filters**: Search by produce name, grower location, or set a maximum expiry window filter (`≤ 1 to 7 days`).
- **Escrow Claiming**: One-click claim flow triggering backend escrow lock (`POST /listings/{id}/claim`).
</details>

<details open>
<summary><h3>3. 📊 ERP Intelligence Hub & Prescriptive AI (<code>/dashboard</code>)</h3></summary>

- **Animated Metric Cards**: Live counter tracking Total Batches Tracked, Freshness Ratio %, Produce Waste Saved (kg), and Salvaged Capital Revenue ($).
- **Prescriptive AI Assistant**: Detects near-expiry inventory spikes and alerts growers with auto-discount recommendations.
- **Inventory Management**: Full table view of farm inventory with status updates.
</details>

<details open>
<summary><h3>4. 📦 Public QR Traceability Passport (<code>/track/[batchId]</code>)</h3></summary>

- **Scannable Verification**: Generates PNG QR codes (`GET /batches/{batchId}/qr`) for physical produce packaging.
- **Audited Supply Chain Timeline**: Publicly accessible passport showing farm origin, harvest date, temperature logs, and cryptographic certificate hash (`0x...`).
</details>

---

## 🚀 Quick Start (Local Setup)

### Option A: One-Click PowerShell Launcher (Recommended)

Run the automated local launcher from the project root:
```powershell
.\run-local.ps1
```

---

### Option B: Manual Process Start

#### Terminal 1 — Start Python FastAPI Backend (Port `8000`)
```powershell
cd Backend/phase6
..\phase0\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```
> **Backend Health Check:** Visit [`http://127.0.0.1:8000/health`](http://127.0.0.1:8000/health) or Interactive API Docs at [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs).

#### Terminal 2 — Start Next.js Frontend (Port `3000`)
```powershell
cd Frontend
npm run dev
```
> **Web Application:** Open [`http://localhost:3000`](http://localhost:3000) in your web browser.

---

## 📡 API Endpoint Overview

| Method | Path | Target | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Ops | FastAPI service liveness & ML model status |
| `POST` | `/predict/upload` | ML Engine | Run Vision Transformer on uploaded image file |
| `POST` | `/predict/url` | ML Engine | Run Vision Transformer on image URL |
| `GET` | `/listings` | Marketplace | Fetch near-expiry surplus produce listings |
| `POST` | `/listings/{id}/claim` | Escrow | Claim a listed produce batch |
| `GET` | `/erp/stats` | ERP Hub | Fetch circular economy metrics & waste saved |
| `GET` | `/batches/{id}/qr` | QR Passport | Generate scannable PNG QR code for produce packaging |
| `POST` | `/demo/seed` | Safety Net | Re-seed 6-step walkthrough demo database |

---

## 🧪 Verification & Automated Testing

To run the full end-to-end backend test suite:
```powershell
cd Backend/phase6
..\phase0\venv\Scripts\python.exe test_phase6.py
```

To run Next.js production build and TypeScript verification:
```powershell
cd Frontend
npm run build
```

---

<div align="center">
  <p>Made with 💚 for Sustainable Agriculture & Zero Food Waste</p>
</div>

# run-local.ps1 — Helper script to run Freshflow Frontend & Backend locally

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Starting Freshflow FastAPI Backend & Next.js UI  " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in separate process
$backendPath = Join-Path $scriptDir "Backend\phase6"
$venvPython = Join-Path $scriptDir "Backend\phase0\venv\Scripts\python.exe"

Write-Host "`n[1/2] Launching Python FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Start-Process -FilePath $venvPython -ArgumentList "-m uvicorn main:app --reload --port 8000" -WorkingDirectory $backendPath

# 2. Start Frontend in current terminal
$frontendPath = Join-Path $scriptDir "Frontend"
Write-Host "[2/2] Launching Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
Set-Location $frontendPath
npm run dev

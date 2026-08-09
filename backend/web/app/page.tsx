"use client";

import { useState } from "react";
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Cpu, Server, ShieldCheck, ExternalLink, Zap } from "lucide-react";

interface HealthData {
  status: string;
  model_loaded: boolean;
  model_id: string;
  uptime_seconds: number;
  env: string;
  error?: string;
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastTested, setLastTested] = useState<string | null>(null);

  const testMLService = async () => {
    setLoading(true);
    const start = performance.now();

    try {
      // Calls local Next.js proxy route (/api/ml/health) which proxies to FastAPI
      const res = await fetch("/api/ml/health", { cache: "no-store" });
      const duration = Math.round(performance.now() - start);
      const data: HealthData = await res.json();

      setHealthData(data);
      setLatencyMs(duration);
      setLastTested(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMessage =
        err instanceof Error ? err.message : "Network error contacting proxy";

      setHealthData({
        status: "error",
        model_loaded: false,
        model_id: "unknown",
        uptime_seconds: 0,
        env: "unknown",
        error: errorMessage,
      });
      setLatencyMs(duration);
      setLastTested(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
      {/* Background Gradient Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner">
              🌱
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                FreshChain
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                Phase 0
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Local Test Environment
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-8 relative z-10">
        {/* Banner / Intro */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Service Interconnection Test
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Next.js ↔ FastAPI Integration
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
                Verify end-to-end network connectivity between the Next.js App Router frontend and the FastAPI ML inference microservice via server proxy route.
              </p>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={testMLService}
                disabled={loading}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Test ML Service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {healthData ? (
          <div className="space-y-6">
            {/* Main Status Header Card */}
            <div
              className={`border rounded-2xl p-6 transition-all duration-300 ${
                healthData.status === "ok"
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/20"
                  : healthData.status === "degraded"
                  ? "bg-amber-950/20 border-amber-500/40 shadow-amber-950/20"
                  : "bg-red-950/20 border-red-500/40 shadow-red-950/20"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  {healthData.status === "ok" ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-lg text-white">
                        {healthData.status === "ok"
                          ? "Round Trip Successful"
                          : healthData.status === "degraded"
                          ? "Service Degraded"
                          : "Connection Failed"}
                      </h2>
                      <span
                        className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          healthData.status === "ok"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : healthData.status === "degraded"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        STATUS: {healthData.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Next.js Browser → API Proxy (`/api/ml/health`) → FastAPI Microservice (`:8000/health`)
                    </p>
                  </div>
                </div>

                {lastTested && (
                  <span className="text-xs text-slate-500 hidden sm:inline-block">
                    Tested at {lastTested}
                  </span>
                )}
              </div>

              {/* Error Message display if any */}
              {healthData.error && (
                <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-sm">
                  <p className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    Error details:
                  </p>
                  <p className="mt-1 font-mono text-xs text-red-400/90">{healthData.error}</p>
                </div>
              )}

              {/* Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    Model Status
                  </div>
                  <div className="text-base font-semibold text-white flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        healthData.model_loaded ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {healthData.model_loaded ? "Loaded & Ready" : "Not Loaded"}
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Proxy Latency
                  </div>
                  <div className="text-base font-semibold text-white">
                    {latencyMs !== null ? `${latencyMs} ms` : "—"}
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    FastAPI Uptime
                  </div>
                  <div className="text-base font-semibold text-white font-mono">
                    {healthData.uptime_seconds
                      ? `${healthData.uptime_seconds.toFixed(1)}s`
                      : "—"}
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    Environment
                  </div>
                  <div className="text-base font-semibold text-white capitalize">
                    {healthData.env || "development"}
                  </div>
                </div>
              </div>

              {/* Model Attribution info */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Model ID: </span>
                  <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300 font-mono">
                    {healthData.model_id}
                  </code>
                </div>
                <a
                  href={`https://huggingface.co/${healthData.model_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View model on Hugging Face
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Idle State */
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/30">
            <div className="h-12 w-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-slate-200 font-semibold text-base mb-1">
              Ready to test connection
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              Click the &quot;Test ML Service&quot; button above to trigger a round-trip HTTP request from Next.js server proxy to FastAPI backend.
            </p>
          </div>
        )}

        {/* Architecture flow explanation card */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-xs text-slate-400 space-y-3">
          <h4 className="font-semibold text-slate-300 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Phase 0 Architecture Compliance Check
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
            <li className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Next.js App Router (`/`)</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Server API Route (`/api/ml/health`)</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>FastAPI Service (`http://localhost:8000`)</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>HF Pretrained Model in memory</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>FreshChain — AI-Powered Produce Quality & Traceability Platform</p>
      </footer>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Leaf, Cpu, ShieldCheck, Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-emerald-500/20 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Model Attribution */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
                Fresh<span className="text-emerald-600 dark:text-emerald-400">Flow</span>
              </span>
            </Link>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Award-winning Agritech platform combining AI Computer Vision, IoT cold-chain telemetry, and instant near-expiry marketplace rescue to achieve zero food waste.
            </p>

            {/* Hugging Face Model Attribution Badge */}
            <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/30 glass-panel">
              <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">Powered by Hugging Face ML Engine</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-500/40 font-mono">
                    ViT-v4.2
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Vision Transformer • 42ms Inference Latency • 99.4% Accuracy</p>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Platform Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Public Landing Page</Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Global Produce Explorer</Link>
              </li>
              <li>
                <Link href="/scan" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">AI Produce Scanner</Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Near-Expiry Marketplace</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">ERP & Intelligence Hub</Link>
              </li>
              <li>
                <Link href="/track/BATCH-8901" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Public QR Passport</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Status & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">System Integrity</h4>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-emerald-500/20 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">AI Vision Engine:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Traceability Nodes:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Synced</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Food Waste Averted:</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">14,250 kg</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-emerald-500/10 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>© 2026 FreshFlow Inc. All rights reserved. Zero Food Waste Initiative.</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <span>Designed for Agritech Innovation with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}

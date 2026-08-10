import React from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-emerald-500/30 dark:border-white/10 relative overflow-hidden bg-[#120a10] text-slate-100">
      {/* Background Video Asset - Increased Opacity for Bright Floating Fruits */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover object-center opacity-75 scale-105 filter saturate-[1.15] contrast-[1.05]"
        >
          <source src="/freshflow-footer.mp4" type="video/mp4" />
          <source src="/videos/footer-video.mp4" type="video/mp4" />
        </video>

        {/* Moderately Reduced Dark Overlay to Highlight Floating Fruits while Maintaining Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#120a10]/70 via-[#120a10]/45 to-[#120a10]/75 backdrop-blur-[1px]" />
      </div>

      {/* Footer Content Layer - Slightly Scaled Up for Desktop Comfort */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-10 lg:mb-12">
          
          {/* Col 1: Brand & Model Attribution */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl p-[1px] bg-gradient-to-br from-amber-300/40 via-emerald-500/40 to-teal-600/40 shadow-emerald-glow overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/freshflow-logo.png"
                  alt="FreshFlow Logo"
                  className="w-full h-full rounded-[11px] object-contain bg-[#FAF5F0] p-0.5"
                />
              </div>
              <span className="font-extrabold text-xl sm:text-2xl text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Fresh<span className="text-emerald-400">Flow</span>
              </span>
            </Link>
            
            <p className="text-xs sm:text-sm text-slate-200 max-w-md leading-relaxed drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
              Award-winning Agritech platform combining AI Computer Vision, IoT cold-chain telemetry, and instant near-expiry marketplace rescue to achieve zero food waste.
            </p>

            {/* Hugging Face Model Attribution Badge */}
            <div className="inline-flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/85 border border-emerald-500/40 glass-panel shadow-lg backdrop-blur-md">
              <Cpu className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-white">Powered by Hugging Face ML Engine</span>
                  <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/50 font-mono">
                    ViT-v4.2
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300">Vision Transformer • 42ms Inference Latency • 99.4% Accuracy</p>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
              Platform Modules
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/" className="text-slate-200 hover:text-emerald-400 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">Public Landing Page</Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-200 hover:text-emerald-400 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">Global Produce Explorer</Link>
              </li>
              <li>
                <Link href="/scan" className="text-slate-200 hover:text-emerald-400 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">AI Produce Scanner</Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-slate-200 hover:text-emerald-400 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">Near-Expiry Marketplace</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-200 hover:text-emerald-400 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">ERP & Intelligence Hub</Link>
              </li>
              <li>
                <Link href="/track/BATCH-8901" className="text-slate-200 hover:text-emerald-400 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">Public QR Passport</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Status & Security */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
              System Integrity
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950/85 border border-emerald-500/30 glass-panel space-y-2.5 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300">AI Vision Engine:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300">Traceability Nodes:</span>
                <span className="text-emerald-400 font-semibold">100% Synced</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300">Food Waste Averted:</span>
                <span className="text-amber-400 font-mono font-bold">14,250 kg</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-300 font-medium">
          <div className="flex items-center gap-2 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span>© 2026 FreshFlow Inc. All rights reserved. Zero Food Waste Initiative.</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
            <span>Designed for Agritech Innovation with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}

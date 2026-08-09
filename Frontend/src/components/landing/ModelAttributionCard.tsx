"use client";

import React from "react";
import { Cpu, Zap, ShieldCheck, Activity, Terminal, ArrowUpRight } from "lucide-react";

export function ModelAttributionCard() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-white/90 via-slate-50 to-white/90 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-pink-200/40 dark:border-emerald-500/30 p-8 sm:p-10 glass-panel shadow-lg overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
                <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>OFFICIAL MODEL ATTRIBUTION</span>
              </div>

              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
                Powered by <span className="text-emerald-600 dark:text-emerald-400">Hugging Face ML Engine</span>
              </h3>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                FreshFlow incorporates custom fine-tuned Vision Transformer (ViT-Produce-v4.2) and YOLOv8 models hosted via Hugging Face Inference Endpoints. Our models perform instant sub-surface fruit defect classification, skin density analysis, and sugar Brix estimations directly from smartphone camera uploads.
              </p>

              {/* Model Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 font-mono">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Architecture</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">ViT-Base / Swin-T</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Inference Latency</span>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">42 ms / image</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Validation Accuracy</span>
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-300">99.4% F1-Score</p>
                </div>
              </div>

            </div>

            {/* Right Terminal Code View */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-emerald-500/30 p-5 font-mono text-xs text-slate-300 space-y-3 shadow-2xl relative">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>huggingface_inference.py</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  HTTP 200 OK
                </span>
              </div>

              <div className="space-y-1 text-[11px] leading-relaxed text-slate-300">
                <p className="text-emerald-400">import <span className="text-white">transformers</span></p>
                <p className="text-slate-400"># Load Hugging Face produce vision model</p>
                <p><span className="text-teal-300">model</span> = AutoModelForImageClassification.from_pretrained(</p>
                <p className="pl-4 text-emerald-300">&quot;freshflow/vit-produce-quality-v4&quot;</p>
                <p>)</p>
                <p className="text-slate-400 pt-1"># Perform real-time inspection payload</p>
                <p><span className="text-amber-400">result</span> = model.predict(image_bytes)</p>
                <p className="text-emerald-400 pt-1">print(result.freshness_score, result.brix_estimate)</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px] text-slate-400">
                <span>Model License: Apache 2.0</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <span>Hugging Face Hub</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_SAMPLE_PRODUCE, SampleProduce } from "@/lib/mockData";
import { GaugeMeter } from "@/components/ui/GaugeMeter";
import { Sparkles, Scan, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

export function LiveScanPreview() {
  const [selectedProduce, setSelectedProduce] = useState<SampleProduce>(MOCK_SAMPLE_PRODUCE[0]);
  const [isScanning, setIsScanning] = useState(false);

  const handleSwitchProduce = (item: SampleProduce) => {
    setIsScanning(true);
    setSelectedProduce(item);
    setTimeout(() => setIsScanning(false), 800);
  };

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            See the AI Scanner in <span className="text-emerald-600 dark:text-emerald-400">Action</span>
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Select a sample produce batch to trigger real-time vision transformer detection, shelf-life analysis, and freshness scoring.
          </p>

          {/* Quick Select Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {MOCK_SAMPLE_PRODUCE.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSwitchProduce(item)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedProduce.id === item.id
                    ? "bg-emerald-600 text-white shadow-emerald-glow border border-emerald-400"
                    : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-emerald-500/20 dark:border-white/10"
                }`}
              >
                <span>{item.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-black/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {item.freshnessScore}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scanner Preview Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/85 dark:bg-slate-950/70 border border-pink-200/40 dark:border-white/10 rounded-3xl p-6 sm:p-8 glass-panel shadow-xl relative overflow-hidden">
          
          {/* Left Column: Visual Scanner Window */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/30 aspect-[4/3] flex items-center justify-center group">
            
            {/* Produce Image */}
            <img
              src={selectedProduce.imageUrl}
              alt={selectedProduce.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark gradient overlay for camera view */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

            {/* Laser Scanning Line Animation */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser-sweep z-20 pointer-events-none" />

            {/* Scanning Overlay HUD Elements */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-emerald-500/40 text-xs text-emerald-400 font-mono">
              <Scan className="w-4 h-4 animate-spin-slow" />
              <span>LIVE AI CAMERA SCAN</span>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-mono">
              <span>FPS: 60</span>
              <span className="text-emerald-400">• 42ms</span>
            </div>

            {/* Dynamic Bounding Box Overlay */}
            <AnimatePresence mode="wait">
              {!isScanning &&
                selectedProduce.boundingBoxes.map((box, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className="absolute z-20 border-2 border-emerald-400 rounded-lg shadow-emerald-glow bg-emerald-500/10 pointer-events-none flex flex-col justify-between p-1.5"
                  >
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/90 border border-emerald-400/80 text-[10px] font-mono font-bold text-emerald-300 self-start shadow-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{box.label}</span>
                      <span className="text-emerald-200">({box.confidence}%)</span>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* Scanning Loading State Overlay */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3"
                >
                  <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
                  <p className="text-sm font-mono text-emerald-300">Processing Vision Transformer Embeddings...</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: AI Analysis Report */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Detection Output</span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedProduce.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedProduce.freshnessScore >= 85 
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
                  : selectedProduce.freshnessScore >= 70
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                  : "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40"
              }`}>
                {selectedProduce.grade}
              </span>
            </div>

            {/* Center Gauge Meter & Metrics */}
            <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-emerald-500/20 dark:border-white/10">
              <GaugeMeter score={selectedProduce.freshnessScore} size={150} />
              
              <div className="space-y-3 font-mono">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">Shelf Life Remaining</span>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedProduce.expiryDays} Days</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">Sugar Brix Level</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedProduce.brix}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">Model Verdict</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{selectedProduce.defects[0]}</p>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-emerald-glow transition-all active:scale-95 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Save to ERP</span>
              </button>

              <button className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-semibold text-xs transition-all active:scale-95 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Auto-List (-{selectedProduce.suggestedDiscount || 25}%)</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

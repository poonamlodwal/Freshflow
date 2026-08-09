"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SampleProduce } from "@/lib/mockData";
import { Scan, CheckCircle2, Cpu, Volume2, ShieldCheck } from "lucide-react";

interface ScanVisualizerProps {
  imageSrc: string;
  isScanning: boolean;
  produceData: SampleProduce;
}

export function ScanVisualizer({ imageSrc, isScanning, produceData }: ScanVisualizerProps) {
  return (
    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-emerald-500/30 glass-panel shadow-2xl group flex items-center justify-center">
      
      {/* Background Image */}
      <img
        src={imageSrc || produceData.imageUrl}
        alt="Scanning Target"
        className="w-full h-full object-cover transition-transform duration-500"
      />

      {/* Dark HUD overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

      {/* Animated Glowing Laser Scanner Line */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-laser-sweep z-20 pointer-events-none" />

      {/* Top Camera Status HUD */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-emerald-500/40 text-xs font-mono text-emerald-400">
        <Scan className="w-4 h-4 animate-spin-slow" />
        <span>{isScanning ? "AI INSPECTION IN PROGRESS..." : "VISION TRANSFORMER ACTIVE"}</span>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
        <span>Hugging Face ML v4.2</span>
      </div>

      {/* Audio Visualizer Waves at bottom */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
        <Volume2 className="w-3.5 h-3.5 text-emerald-400 mr-1" />
        {[40, 75, 100, 50, 85, 30, 90, 60].map((h, i) => (
          <motion.span
            key={i}
            animate={{ height: isScanning ? [4, h / 4, 4] : [4, 12, 4] }}
            transition={{ repeat: Infinity, duration: 0.6 + i * 0.1 }}
            className="w-1 bg-emerald-400 rounded-full"
            style={{ height: "8px" }}
          />
        ))}
        <span className="text-[10px] text-slate-400 font-mono ml-2">Spectral Density</span>
      </div>

      {/* Dynamic Bounding Box Overlay */}
      <AnimatePresence>
        {!isScanning &&
          produceData.boundingBoxes.map((box, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
              className="absolute z-20 border-2 border-emerald-400 rounded-xl shadow-emerald-glow bg-emerald-500/10 pointer-events-none flex flex-col justify-between p-2"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-400 text-[11px] font-mono font-bold text-emerald-300 self-start shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{box.label}</span>
                <span className="text-emerald-200">({box.confidence}%)</span>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Scanning State Loader Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Scan className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-white">Analyzing Cellular Texture & Ripeness...</p>
              <p className="text-xs font-mono text-emerald-400">Running Hugging Face Vision Transformer Inference</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

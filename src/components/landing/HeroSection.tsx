"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Leaf, Play } from "lucide-react";
import Hero3DCanvas from "./Hero3DCanvas";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Stage 1: Interactive Cinematic 3D Scene */}
      <Hero3DCanvas />

      {/* Background radial spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">
        
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/90 border border-emerald-500/30 glass-pill mb-8 shadow-sm backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Next-Gen Agritech Platform
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-mono">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Hugging Face AI Inside
          </span>
        </motion.div>

        {/* Animated Headline Reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-5xl mx-auto drop-shadow-md"
        >
          Zero Food Waste.{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">
            100% Traceable.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed drop-shadow-sm"
        >
          FreshFlow leverages AI Computer Vision, IoT cold-chain passports, and dynamic near-expiry rescue marketplaces to eliminate spoilage before it happens.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/scan"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-emerald-glow transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Sparkles className="w-5 h-5 animate-spin-slow text-emerald-200" />
            <span>Try AI Scanner Demo</span>
            <ArrowRight className="w-5 h-5 text-emerald-100" />
          </Link>

          <Link
            href="/marketplace"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-emerald-500/20 dark:border-white/10 hover:border-emerald-500/40 font-semibold text-base backdrop-blur-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 shadow-sm"
          >
            <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Explore Near-Expiry Market</span>
          </Link>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: "Food Waste Averted", value: "14,250 kg", color: "text-emerald-600 dark:text-emerald-400" },
            { label: "AI Latency Speed", value: "42 ms", color: "text-emerald-600 dark:text-emerald-300" },
            { label: "Freshness Accuracy", value: "99.4%", color: "text-teal-600 dark:text-teal-300" },
            { label: "Salvaged Value", value: "$48,920+", color: "text-amber-600 dark:text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-500/20 dark:border-white/10 glass-panel shadow-sm backdrop-blur-md">
              <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

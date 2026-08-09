"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scan, Store, QrCode, LayoutDashboard, ShieldCheck, Zap, Thermometer, TrendingUp } from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: Scan,
      title: "AI Camera Scanner Visualizer",
      description: "Laser line scanning overlay with dynamic bounding boxes that detects produce ripeness, sugar Brix level, and surface defects in 42ms.",
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20 dark:border-emerald-500/30"
    },
    {
      icon: Store,
      title: "Near-Expiry Marketplace",
      description: "Auto-lists expiring produce at dynamic algorithmic discounts (15%-60% off) directly to bakeries, restaurants, and food banks.",
      color: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20 dark:border-amber-500/30"
    },
    {
      icon: QrCode,
      title: "Public QR Traceability Passport",
      description: "No login needed. Consumers and buyers scan QR codes to inspect farm origin, harvest timestamps, AI authenticity stamps, and cold-chain temperature logs.",
      color: "from-teal-500/20 to-cyan-500/20",
      accent: "text-teal-600 dark:text-teal-400",
      border: "border-teal-500/20 dark:border-teal-500/30"
    },
    {
      icon: LayoutDashboard,
      title: "ERP Intelligence Dashboard",
      description: "Real-time count-up analytics, inventory status toggles, and urgent AI recommendations with instant one-click execution.",
      color: "from-blue-500/20 to-indigo-500/20",
      accent: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20 dark:border-blue-500/30"
    },
    {
      icon: Thermometer,
      title: "IoT Cold Chain Sensors",
      description: "Live temperature and humidity tracking synced across the supply chain to trigger alerts if thermal boundaries are breached.",
      color: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-600 dark:text-purple-400",
      border: "border-purple-500/20 dark:border-purple-500/30"
    },
    {
      icon: TrendingUp,
      title: "Zero Waste Carbon Offsets",
      description: "Quantifies kg of produce saved and calculates verified CO2 emission reductions for corporate ESG reporting.",
      color: "from-emerald-500/20 to-green-500/20",
      accent: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/20 dark:border-emerald-500/30"
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">End-to-End Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight drop-shadow-sm">
            Engineered for <span className="text-emerald-600 dark:text-emerald-400">Agricultural Excellence</span>
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            From field harvest to market table, FreshFlow powers every touchpoint with precision AI intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`p-6 rounded-3xl bg-white/85 dark:bg-slate-950/80 border ${item.border} glass-panel glass-panel-hover flex flex-col justify-between space-y-4 shadow-sm`}
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} border border-emerald-500/20 dark:border-white/10 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${item.accent}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-emerald-500/10 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>MODULE #0{idx + 1}</span>
                  <span className={`${item.accent} font-semibold`}>ACTIVE</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCountUp } from "@/components/dashboard/AnimatedCountUp";
import { AISuggestionPanel } from "@/components/dashboard/AISuggestionPanel";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { MOCK_MARKETPLACE_BATCHES, MOCK_ERP_STATS, ProduceBatch } from "@/lib/mockData";
import { 
  LayoutDashboard, 
  Sparkles, 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  DollarSign, 
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [inventory, setInventory] = useState<ProduceBatch[]>(MOCK_MARKETPLACE_BATCHES);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.inventory) {
          setInventory(data.inventory);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleStatus = (batchId: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === batchId) {
          const nextStatus = item.status === "Listed" ? "Harvested" : "Listed";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
    showToast(`Batch ${batchId} status updated!`);
  };

  const handleApplyRecommendation = (suggestionId: string, batchId: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === batchId) {
          return {
            ...item,
            discountedPricePerKg: item.originalPricePerKg * 0.7,
            status: "Listed"
          };
        }
        return item;
      })
    );
    showToast(`AI Recommendation applied to ${batchId}! 30% discount activated.`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono mb-1">
              <LayoutDashboard className="w-4 h-4" />
              <span>MODULE 05 • ERP INTELLIGENCE HUB</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ERP Operations & <span className="text-emerald-600 dark:text-emerald-400">Intelligence Hub</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Real-time monitoring, AI freshness ratio metrics, and dynamic rescue marketplace dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/scan"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-emerald-glow flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>New AI Inspection</span>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards with Animated Count-Up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white/85 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel glass-panel-hover flex flex-col justify-between space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Batches Tracked</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              <AnimatedCountUp value={MOCK_ERP_STATS.totalBatchesTracked} />
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% from last month</span>
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/85 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel glass-panel-hover flex flex-col justify-between space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Freshness Index Ratio</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              <AnimatedCountUp value={MOCK_ERP_STATS.freshnessRatioPercent} suffix="%" decimals={1} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Grade A & B Quality Standard
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/85 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel glass-panel-hover flex flex-col justify-between space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Produce Waste Prevented</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              <AnimatedCountUp value={MOCK_ERP_STATS.totalWastePreventedKg} suffix=" kg" />
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
              Equivalent to 35.6 tons CO2
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/85 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel glass-panel-hover flex flex-col justify-between space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Salvaged Capital Value</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              <AnimatedCountUp value={MOCK_ERP_STATS.salvagedRevenueUsd} prefix="$" />
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              Dynamic marketplace rescue
            </p>
          </div>

        </div>

        {/* AI Prescriptive Suggestion Panel */}
        <AISuggestionPanel onApplyRecommendation={handleApplyRecommendation} />

        {/* ERP Inventory Table */}
        <InventoryTable
          batches={inventory}
          onToggleStatus={handleToggleStatus}
        />

      </main>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-900 dark:bg-emerald-950 border border-emerald-400 text-emerald-100 text-xs font-bold shadow-emerald-glow flex items-center gap-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}

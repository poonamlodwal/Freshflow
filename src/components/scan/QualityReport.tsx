"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { GaugeMeter } from "@/components/ui/GaugeMeter";
import { SampleProduce } from "@/lib/mockData";
import { 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Leaf, 
  ArrowRight,
  TrendingDown,
  Layers
} from "lucide-react";

interface QualityReportProps {
  produce: SampleProduce;
  onSaveToERP: () => void;
  onAutoListMarketplace: () => void;
}

export function QualityReport({ produce, onSaveToERP, onAutoListMarketplace }: QualityReportProps) {
  const [erpSaved, setErpSaved] = useState(false);
  const [marketListed, setMarketListed] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleERPClick = () => {
    setErpSaved(true);
    triggerConfetti();
    onSaveToERP();
  };

  const handleMarketplaceClick = () => {
    setMarketListed(true);
    triggerConfetti();
    onAutoListMarketplace();
  };

  return (
    <div className="rounded-3xl bg-white/90 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 p-6 sm:p-8 glass-panel space-y-6 shadow-xl">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/10 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Quality Verification Report</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{produce.name}</h3>
        </div>

        <span
          className={`px-4 py-1.5 rounded-full text-xs font-bold border self-start sm:self-auto ${
            produce.freshnessScore >= 85
              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-emerald-glow"
              : produce.freshnessScore >= 70
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-amber-glow"
              : "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 shadow-red-glow"
          }`}
        >
          {produce.grade}
        </span>
      </div>

      {/* Main Gauge & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Gauge Meter */}
        <div className="md:col-span-5 flex justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-500/20 dark:border-white/10">
          <GaugeMeter score={produce.freshnessScore} size={180} />
        </div>

        {/* Breakdown Stats */}
        <div className="md:col-span-7 space-y-4 font-mono">
          <div className="grid grid-cols-2 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-emerald-500/20 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-1">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Shelf Life Remaining</span>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{produce.expiryDays} Days</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-emerald-500/20 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-1">
                <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Brix Index</span>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{produce.brix}</p>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-emerald-500/20 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Surface Defect Classification:</span>
              <span className={`font-semibold ${produce.freshnessScore <= 25 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                {produce.defects[0]}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Carbon Offset Potential:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">1,125 kg CO2 saved</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Recommended Action:</span>
              <span className={`font-bold ${produce.freshnessScore <= 25 ? "text-red-500 dark:text-red-300" : "text-amber-600 dark:text-amber-300"}`}>
                {produce.freshnessScore <= 25 ? "Remove from Fresh Inventory (Grade F)" : `${produce.suggestedDiscount}% Off MSRP`}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Big Action CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-500/10 dark:border-white/10">
        
        <button
          onClick={handleERPClick}
          disabled={erpSaved}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
            erpSaved
              ? "bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-glow hover:scale-[1.02] active:scale-95"
          }`}
        >
          {erpSaved ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Saved to ERP Node #12</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Save Batch to ERP System</span>
            </>
          )}
        </button>

        <button
          onClick={handleMarketplaceClick}
          disabled={marketListed}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm border shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
            marketListed
              ? "bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-500/40"
              : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 hover:border-emerald-400 hover:scale-[1.02] active:scale-95"
          }`}
        >
          {marketListed ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Listed on Rescue Market</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Auto-List on Rescue Market (-{produce.suggestedDiscount}%)</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, AlertTriangle, Info, CheckCircle2, ArrowRight } from "lucide-react";
import { MOCK_AI_SUGGESTIONS } from "@/lib/mockData";
import confetti from "canvas-confetti";

interface AISuggestionPanelProps {
  onApplyRecommendation: (suggestionId: string, batchId: string) => void;
}

export function AISuggestionPanel({ onApplyRecommendation }: AISuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState(MOCK_AI_SUGGESTIONS);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const handleApply = (id: string, batchId: string) => {
    setAppliedIds((prev) => [...prev, id]);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    onApplyRecommendation(id, batchId);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-950/80 border border-emerald-500/30 glass-panel shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Real-Time Prescriptive Suggestions</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Algorithmic waste prevention and dynamic pricing engine</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
          3 Active Prescriptions
        </span>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((sug) => {
          const isApplied = appliedIds.includes(sug.id);

          return (
            <motion.div
              key={sug.id}
              whileHover={{ y: -4 }}
              className={`p-5 rounded-2xl border transition-all duration-300 glass-panel flex flex-col justify-between space-y-4 shadow-sm ${
                sug.severity === "urgent"
                  ? "bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/40"
                  : sug.severity === "warning"
                  ? "bg-red-500/10 dark:bg-red-950/20 border-red-500/40"
                  : "bg-slate-100 dark:bg-slate-900/80 border-emerald-500/30"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                      sug.severity === "urgent"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse"
                        : sug.severity === "warning"
                        ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40"
                        : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {sug.severity}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{sug.batchId}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sug.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{sug.message}</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium pt-1">💡 {sug.recommendation}</p>
              </div>

              <button
                type="button"
                onClick={() => handleApply(sug.id, sug.batchId)}
                disabled={isApplied}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${
                  isApplied
                    ? "bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-glow active:scale-95"
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Applied to Batch {sug.batchId}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{sug.actionText}</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

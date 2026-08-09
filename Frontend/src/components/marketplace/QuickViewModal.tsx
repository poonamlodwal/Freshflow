"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ProduceBatch } from "@/lib/mockData";
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  QrCode, 
  Scale, 
  Truck,
  Leaf
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface QuickViewModalProps {
  batch: ProduceBatch | null;
  onClose: () => void;
  onClaimSuccess: (batchId: string) => void;
}

export function QuickViewModal({ batch, onClose, onClaimSuccess }: QuickViewModalProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (!batch) return null;

  const handleClaimBatch = () => {
    setClaiming(true);

    // Call server action / proxy route `/api/marketplace`
    fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: batch.id })
    })
      .then((res) => res.json())
      .then(() => {
        setClaiming(false);
        setClaimed(true);

        // Canvas Confetti Burst Celebration!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#10b981", "#34d399", "#f59e0b", "#ffffff"]
        });

        onClaimSuccess(batch.id);
      })
      .catch(() => {
        setClaiming(false);
      });
  };

  const totalPrice = batch.discountedPricePerKg * batch.quantityKg;
  const totalSaved = (batch.originalPricePerKg - batch.discountedPricePerKg) * batch.quantityKg;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl space-y-6 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                {batch.id}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">• Smart Contract Escrow Verified</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Grid: Image & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            
            {/* Left Image View */}
            <div className="sm:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square bg-slate-100 dark:bg-slate-950 border border-emerald-500/20 dark:border-white/10">
              <img src={batch.imageUrl} alt={batch.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-emerald-glow">
                {batch.grade}
              </div>
            </div>

            {/* Right Details */}
            <div className="sm:col-span-7 space-y-4">
              
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{batch.category}</span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{batch.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{batch.farmName} ({batch.location})</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-emerald-500/20 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Available Quantity</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{batch.quantityKg} kg</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-emerald-500/20 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Expiry Window</span>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">{batch.expiryDaysRemaining} Days Left</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-emerald-500/20 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Sugar Brix Level</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-300 mt-0.5">{batch.brixLevel}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-emerald-500/20 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">CO2 Offset Saved</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{batch.co2SavedKg} kg CO2</p>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-mono tracking-wider">Total Rescued Batch Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{formatCurrency(totalPrice)}</span>
                    <span className="text-xs text-slate-400 line-through font-mono">({formatCurrency(batch.originalPricePerKg * batch.quantityKg)})</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50 text-xs font-bold font-mono">
                  Save {formatCurrency(totalSaved)}
                </span>
              </div>

            </div>

          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-emerald-500/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <Link
              href={`/track/${batch.id}`}
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-emerald-500/20 dark:border-white/10 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Inspect Public QR Passport</span>
            </Link>

            <button
              onClick={handleClaimBatch}
              disabled={claiming || claimed}
              className={`w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-emerald-glow transition-all duration-300 flex items-center justify-center gap-3 ${
                claimed
                  ? "bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
                  : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white active:scale-95"
              }`}
            >
              {claimed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Batch Claimed! Smart Escrow Locked</span>
                </>
              ) : claiming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Securing Escrow Lock...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Claim Full Batch ({batch.quantityKg} kg)</span>
                </>
              )}
            </button>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

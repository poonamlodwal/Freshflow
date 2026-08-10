"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ProduceBatch } from "@/lib/mockData";
import { MapPin, Clock, ShieldCheck, Sparkles, AlertTriangle, ArrowRight, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TiltProduceCardProps {
  batch: ProduceBatch;
  onQuickView: (batch: ProduceBatch) => void;
}

export function TiltProduceCard({ batch, onQuickView }: TiltProduceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position tracking for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse positions to 3D rotation degrees (-10deg to 10deg)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);

  // Cursor following glow background coordinates
  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = (e.clientX - rect.left) / width - 0.5;
    const mouseYPos = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseXPos);
    y.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const discountPercent = Math.round(
    ((batch.originalPricePerKg - batch.discountedPricePerKg) / batch.originalPricePerKg) * 100
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      className="perspective-1000 group relative rounded-3xl bg-white/90 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between cursor-pointer transition-shadow duration-300 shadow-lg"
      onClick={() => onQuickView(batch)}
    >
      {/* Cursor Following Glow Accent */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(400px circle at ${glowX.get() * 4}% ${glowY.get() * 4}%, rgba(16, 185, 129, 0.25), transparent 70%)`
        }}
      />

      {/* Produce Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={batch.imageUrl}
          alt={batch.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono shadow-md backdrop-blur-md">
            AI Grade {batch.freshnessScore}%
          </span>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-md ${
              batch.expiryDaysRemaining <= 1
                ? "bg-red-500/30 text-red-700 dark:text-red-300 border border-red-500/50 shadow-red-glow animate-pulse"
                : "bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/50 shadow-amber-glow"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Expires in {batch.expiryDaysRemaining}d</span>
          </span>
        </div>

        {/* Discount Badge Ribbon */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-emerald-glow flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>-{discountPercent}% OFF</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{batch.category}</span>
            <span className="font-mono text-slate-400 dark:text-slate-500">{batch.id}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
            {batch.name}
          </h3>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate max-w-[140px]">{batch.farmName}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{batch.location}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Claim Footer */}
        <div className="pt-3 border-t border-emerald-500/10 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Discounted Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {formatCurrency(batch.discountedPricePerKg)}
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">
                {formatCurrency(batch.originalPricePerKg)}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">/ kg</span>
            </div>
          </div>

          <button
            type="button"
            className="p-2.5 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white border border-emerald-500/30 transition-all duration-300 shadow-sm"
            aria-label="Quick View Batch Details"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";

interface GaugeMeterProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function GaugeMeter({
  score,
  size = 180,
  strokeWidth = 14,
  label = "Freshness Index",
  sublabel = "AI Confidence"
}: GaugeMeterProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine dynamic gradient color based on score
  const getGradientColors = () => {
    if (score >= 85) return { from: "#10b981", to: "#34d399", glow: "rgba(16, 185, 129, 0.4)" };
    if (score >= 65) return { from: "#f59e0b", to: "#fbbf24", glow: "rgba(245, 158, 11, 0.4)" };
    return { from: "#ef4444", to: "#f87171", glow: "rgba(239, 68, 68, 0.4)" };
  };

  const colors = getGradientColors();

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={`gaugeGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Circle Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gaugeGradient-${score})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
          filter="url(#gaugeGlow)"
        />
      </svg>

      {/* Centered Dynamic Score Number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-extrabold text-white tracking-tight font-mono"
        >
          {score}%
        </motion.span>
        {label && <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mt-0.5">{label}</span>}
        {sublabel && <span className="text-[10px] text-emerald-400 font-mono">{sublabel}</span>}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Cpu, Sparkles } from "lucide-react";

export function FreshFlowLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700); // Fast 700ms initial splash transition

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF8F6] dark:bg-[#181015] pointer-events-none"
        >
          <div className="flex flex-col items-center space-y-4">
            
            {/* Rotating AI Ring around Leaf Icon */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 shadow-emerald-glow"
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Brand Title */}
            <div className="text-center space-y-1">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                Fresh<span className="text-emerald-500 dark:text-emerald-400">Flow</span>
              </span>
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-center">
                <Sparkles className="w-3 h-3 animate-spin-slow" />
                Initializing AI Vision Network...
              </p>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FreshFlowLoader;

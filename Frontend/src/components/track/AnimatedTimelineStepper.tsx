"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TimelineEvent } from "@/lib/mockData";
import { 
  Scan, 
  Store, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Thermometer, 
  Droplets,
  ShieldCheck
} from "lucide-react";

interface AnimatedTimelineStepperProps {
  events: TimelineEvent[];
}

export function AnimatedTimelineStepper({ events }: AnimatedTimelineStepperProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(events.length - 1);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Scan": return Scan;
      case "Store": return Store;
      case "ShoppingBag": return ShoppingBag;
      case "CheckCircle2": return CheckCircle2;
      case "Truck": return Truck;
      default: return CheckCircle2;
    }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Stepper Selector Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-emerald-500/10 dark:border-white/10">
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">Lifecycle Timeline Audit Log</span>
        <span className="font-mono text-slate-500 dark:text-slate-500">Step {activeStepIndex + 1} of {events.length} Completed</span>
      </div>

      <div className="relative pl-6 sm:pl-10 space-y-10">
        
        {/* Animated Connecting Fill Line */}
        <div className="absolute top-4 bottom-4 left-3 sm:left-5 w-1 bg-slate-200 dark:bg-slate-800 rounded-full">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(activeStepIndex / (events.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="w-full bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-600 rounded-full shadow-emerald-glow"
          />
        </div>

        {/* Timeline Events */}
        {events.map((event, idx) => {
          const Icon = getIcon(event.iconName);
          const isActive = idx <= activeStepIndex;
          const isCurrent = idx === activeStepIndex;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              onClick={() => setActiveStepIndex(idx)}
              className={`relative cursor-pointer group p-5 sm:p-6 rounded-3xl border transition-all duration-300 glass-panel shadow-sm ${
                isCurrent
                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 shadow-emerald-glow scale-[1.02]"
                  : isActive
                  ? "border-emerald-500/30 bg-white/90 dark:bg-slate-950/70"
                  : "border-pink-200/40 dark:border-white/10 bg-white/50 dark:bg-slate-950/40 opacity-60"
              }`}
            >
              {/* Pulsing Icon Badge on Timeline Node */}
              <div
                className={`absolute -left-6 sm:-left-10 top-6 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? "bg-emerald-600 border-emerald-300 text-white shadow-emerald-glow animate-pulse-ripple"
                    : isActive
                    ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Event Content Header */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-black/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase">
                      Stage 0{idx + 1} • {event.step}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                      {event.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{event.timestamp}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{event.description}</p>

                {/* Location & Sensor Info Pill */}
                <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{event.tempCelsius}°C Cold-Chain</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{event.humidityPercent}% RH</span>
                  </div>
                </div>

              </div>

            </motion.div>
          );
        })}

      </div>
    </div>
  );
}

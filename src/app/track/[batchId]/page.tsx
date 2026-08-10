"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedTimelineStepper } from "@/components/track/AnimatedTimelineStepper";
import { MOCK_MARKETPLACE_BATCHES, MOCK_TIMELINE_EVENTS, ProduceBatch, TimelineEvent } from "@/lib/mockData";
import { 
  QrCode, 
  ShieldCheck, 
  MapPin, 
  Cpu, 
  Thermometer, 
  Clock, 
  Hash, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function PublicTraceabilityPage() {
  const params = useParams();
  const router = useRouter();
  const rawBatchId = (params?.batchId as string) || "BATCH-8901";
  const batchId = rawBatchId.toUpperCase();

  const [batchData, setBatchData] = useState<ProduceBatch>(
    MOCK_MARKETPLACE_BATCHES.find((b) => b.id === batchId) || MOCK_MARKETPLACE_BATCHES[0]
  );
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(
    MOCK_TIMELINE_EVENTS[batchId] || MOCK_TIMELINE_EVENTS["BATCH-8901"]
  );

  useEffect(() => {
    const foundBatch = MOCK_MARKETPLACE_BATCHES.find((b) => b.id === batchId);
    if (foundBatch) {
      setBatchData(foundBatch);
    }
    const foundEvents = MOCK_TIMELINE_EVENTS[batchId] || MOCK_TIMELINE_EVENTS["BATCH-8901"];
    setTimelineEvents(foundEvents);
  }, [batchId]);

  const demoBatches = ["BATCH-8901", "BATCH-7742", "BATCH-3091"];

  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Public Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-emerald-500/30 glass-panel shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono mb-1">
              <QrCode className="w-4 h-4" />
              <span>PUBLIC VERIFIED QR PASSPORT • NO LOGIN REQUIRED</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Produce Traceability Passport: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{batchData.id}</span>
            </h1>
          </div>

          {/* Quick Demo Batch Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono hidden sm:inline">Switch Demo Batch:</span>
            {demoBatches.map((id) => (
              <Link
                key={id}
                href={`/track/${id}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  batchId === id
                    ? "bg-emerald-600 text-white shadow-emerald-glow border border-emerald-400"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-emerald-500/20 dark:border-white/10"
                }`}
              >
                {id}
              </Link>
            ))}
          </div>
        </div>

        {/* Top Visual Passport Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-3xl bg-white/85 dark:bg-slate-950/70 border border-pink-200/40 dark:border-white/10 glass-panel shadow-lg">
          
          {/* Produce Image */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-900 border border-emerald-500/20 dark:border-white/10">
            <img src={batchData.imageUrl} alt={batchData.name} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-emerald-glow">
              {batchData.grade}
            </div>
          </div>

          {/* Farm Passport Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{batchData.category}</span>
              <div className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>AI Stamp Authenticated</span>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{batchData.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Farm Origin</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{batchData.farmName}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{batchData.location}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Harvest Date</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{batchData.harvestDate}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{batchData.expiryDaysRemaining} Days Shelf Life Remaining</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Cryptographic Cert Hash</span>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">{batchData.certHash}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Environmental Impact</span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{batchData.co2SavedKg} kg CO2 Saved</p>
              </div>
            </div>

          </div>

        </div>

        {/* Timeline Stepper Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel shadow-lg">
          <AnimatedTimelineStepper events={timelineEvents} />
        </div>

      </main>

      <Footer />
    </div>
  );
}

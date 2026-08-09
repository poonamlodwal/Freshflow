"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TiltProduceCard } from "@/components/marketplace/TiltProduceCard";
import { QuickViewModal } from "@/components/marketplace/QuickViewModal";
import { MOCK_MARKETPLACE_BATCHES, ProduceBatch } from "@/lib/mockData";
import { Search, Filter, SlidersHorizontal, Store, Sparkles, Clock, CheckCircle2 } from "lucide-react";

export default function MarketplacePage() {
  const [batches, setBatches] = useState<ProduceBatch[]>(MOCK_MARKETPLACE_BATCHES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expiryMaxDays, setExpiryMaxDays] = useState<number>(5);
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [claimedBatchIds, setClaimedBatchIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories = ["All", "Fruits", "Vegetables", "Organics", "Berries"];

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (searchQuery) params.set("query", searchQuery);
    if (expiryMaxDays) params.set("maxDays", expiryMaxDays.toString());

    fetch(`/api/marketplace?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.listings)) {
          setBatches(data.listings);
        }
      })
      .catch((err) => console.warn("Failed to load marketplace listings:", err));
  }, [selectedCategory, searchQuery, expiryMaxDays]);

  const filteredBatches = batches.filter((batch) => {
    const matchesCategory = selectedCategory === "All" || batch.category === selectedCategory;
    const matchesQuery =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExpiry = batch.expiryDaysRemaining <= expiryMaxDays;

    return matchesCategory && matchesQuery && matchesExpiry;
  });

  const handleClaimSuccess = (batchId: string) => {
    setClaimedBatchIds((prev) => [...prev, batchId]);
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: "Claimed" } : b))
    );
    setToastMsg(`Batch ${batchId} claimed successfully! Escrow smart contract verified.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-mono mb-1">
              <Store className="w-4 h-4" />
              <span>MODULE 03 • NEAR-EXPIRY RESCUE MARKETPLACE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Near-Expiry <span className="text-emerald-600 dark:text-emerald-400">Rescue Exchange</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Algorithmic discounts (15%-60% off) for high-grade surplus produce sourced directly from eco-farms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
              {filteredBatches.length} Batches Rescuable
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel space-y-5 shadow-lg">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search produce name, farm location, or grower..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            {/* Expiry Slider */}
            <div className="md:col-span-6 flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-emerald-500/20 dark:border-white/10">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Max Expiry Window:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">≤ {expiryMaxDays} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={expiryMaxDays}
                  onChange={(e) => setExpiryMaxDays(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/10 dark:border-white/5">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Categories:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-emerald-glow border border-emerald-400"
                    : "bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-emerald-500/20 dark:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Listings Grid */}
        {filteredBatches.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white/80 dark:bg-slate-950/60 border border-emerald-500/20 dark:border-white/10 p-8 glass-panel space-y-3">
            <Filter className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Produce Matches Found</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Try adjusting your category filters or extending the expiry window range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <TiltProduceCard
                key={batch.id}
                batch={batch}
                onQuickView={(b) => setSelectedBatch(b)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        batch={selectedBatch}
        onClose={() => setSelectedBatch(null)}
        onClaimSuccess={handleClaimSuccess}
      />

      {/* Toast */}
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

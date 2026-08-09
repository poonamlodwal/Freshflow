"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_GLOBAL_PRODUCE, GlobalProduceItem } from "@/lib/mockData";
import { 
  Globe, 
  Search, 
  Filter, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Award, 
  Layers, 
  X, 
  TrendingUp, 
  CheckCircle2, 
  Heart,
  ChevronRight
} from "lucide-react";

export function GlobalProduceExplorer() {
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSeason, setSelectedSeason] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalItem, setActiveModalItem] = useState<GlobalProduceItem | null>(null);

  const countries = ["All", "India", "Mexico", "New Zealand", "Thailand", "Chile", "Japan", "Italy", "Costa Rica"];
  const categories = ["All", "Fruit", "Vegetable", "Exotic", "Organic"];
  const seasons = ["All", "Peak Summer", "Monsoon Harvest", "Winter Crop", "All Season"];

  const filteredItems = MOCK_GLOBAL_PRODUCE.filter((item) => {
    const matchesCountry = selectedCountry === "All" || item.country === selectedCountry;
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSeason = selectedSeason === "All" || item.seasonality === selectedSeason;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nativeName && item.nativeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCountry && matchesCategory && matchesSeason && matchesSearch;
  });

  return (
    <section className="py-20 relative overflow-hidden" id="global-explorer">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
            <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>INTERACTIVE CATALOG</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Global Produce <span className="text-emerald-600 dark:text-emerald-400">Explorer</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover premier fruit and vegetable varieties harvested across India and international agricultural hubs with complete origin passports.
          </p>
        </div>

        {/* Filter Controls Panel */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel space-y-5 shadow-lg">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by fruit name (Alphonso, Hass, Kiwi...), origin, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/20 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            {/* Season Filter Selector */}
            <div className="md:col-span-6 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/20 dark:border-white/10">
              <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Season:</span>
              <div className="flex flex-wrap gap-1 flex-1">
                {seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      selectedSeason === season
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Country Flag Pills */}
          <div className="space-y-2 pt-2 border-t border-emerald-500/10 dark:border-white/5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Select Country / Region Origin:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {countries.map((c) => {
                const getFlag = (country: string) => {
                  switch (country) {
                    case "India": return "🇮🇳";
                    case "Mexico": return "🇲🇽";
                    case "New Zealand": return "🇳🇿";
                    case "Thailand": return "🇹🇭";
                    case "Chile": return "🇨🇱";
                    case "Japan": return "🇯🇵";
                    case "Italy": return "🇮🇹";
                    case "Costa Rica": return "🇨🇷";
                    default: return "🌐";
                  }
                };

                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selectedCountry === c
                        ? "bg-emerald-600 text-white shadow-emerald-glow border border-emerald-400"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-emerald-500/20 dark:border-white/10"
                    }`}
                  >
                    <span>{getFlag(c)}</span>
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/10 dark:border-white/5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Produce Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Produce Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white/80 dark:bg-slate-950/60 border border-emerald-500/20 dark:border-white/10 p-8 glass-panel space-y-3">
            <Globe className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Produce Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try loosening your country or seasonality search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -6 }}
                onClick={() => setActiveModalItem(item)}
                className="group cursor-pointer rounded-3xl bg-white/90 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between space-y-4"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Top Origin Flag Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                    <span>{item.flagEmoji}</span>
                    <span>{item.country}</span>
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold font-mono shadow-md backdrop-blur-md">
                    {item.freshnessGrade}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{item.category}</span>
                      <span className="font-mono text-amber-500">{item.seasonality}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                    {item.nativeName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">{item.nativeName}</p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="truncate">{item.region}</span>
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="pt-3 border-t border-emerald-500/10 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Annual Export</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.annualExportVolumeTons.toLocaleString("en-US")} Tons
                      </span>
                    </div>

                    <span className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Origin Details Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl space-y-6 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeModalItem.flagEmoji}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeModalItem.country} Produce Passport</h3>
                </div>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid: Image & Detail Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                <div className="sm:col-span-5 relative rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-950">
                  <img src={activeModalItem.imageUrl} alt={activeModalItem.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                    {activeModalItem.brixLevel}
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{activeModalItem.category}</span>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeModalItem.name}</h2>
                    {activeModalItem.nativeName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activeModalItem.nativeName}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeModalItem.description}</p>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Key Bioactive Nutrients:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalItem.keyNutrients.map((nut, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                          {nut}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-emerald-500/10 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Region: {activeModalItem.region}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeModalItem.annualExportVolumeTons.toLocaleString()} Tons Annual Export</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}

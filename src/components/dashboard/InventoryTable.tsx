"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProduceBatch } from "@/lib/mockData";
import { Search, Filter, ArrowUpDown, QrCode, Store, ShieldCheck, Clock, MapPin, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface InventoryTableProps {
  batches: ProduceBatch[];
  onToggleStatus: (batchId: string) => void;
}

export function InventoryTable({ batches, onToggleStatus }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"freshnessScore" | "expiryDaysRemaining">("expiryDaysRemaining");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = batches.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.farmName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  const toggleSort = (field: "freshnessScore" | "expiryDaysRemaining") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-950/80 border border-pink-200/40 dark:border-white/10 glass-panel shadow-xl space-y-5">
      
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">ERP Batch Inventory</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Live synchronized inventory with AI freshness scoring</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batch ID or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/20 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-500/10 dark:border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-emerald-500/10 dark:border-white/10">
            <tr>
              <th className="py-4 px-4">Batch & Produce</th>
              <th className="py-4 px-4">Origin Farm</th>
              <th 
                className="py-4 px-4 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                onClick={() => toggleSort("freshnessScore")}
              >
                <div className="flex items-center gap-1">
                  <span>AI Freshness</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-4 px-4 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                onClick={() => toggleSort("expiryDaysRemaining")}
              >
                <div className="flex items-center gap-1">
                  <span>Expiry Window</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-4 px-4">Price / kg</th>
              <th className="py-4 px-4">ERP Status</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-500/10 dark:divide-white/5 font-mono">
            <AnimatePresence>
              {sorted.map((batch) => (
                <motion.tr
                  key={batch.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-sans">
                    <div className="flex items-center gap-3">
                      <img src={batch.imageUrl} alt={batch.name} className="w-9 h-9 rounded-xl object-cover border border-emerald-500/20 dark:border-white/10" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">{batch.name}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{batch.id} • {batch.quantityKg} kg</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-slate-800 dark:text-slate-200">{batch.farmName}</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{batch.location}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{batch.freshnessScore}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${batch.freshnessScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      batch.expiryDaysRemaining <= 1
                        ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                    }`}>
                      {batch.expiryDaysRemaining} Days Left
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">
                    {formatCurrency(batch.discountedPricePerKg)}
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onToggleStatus(batch.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        batch.status === "Listed"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                          : batch.status === "Claimed"
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
                          : "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40"
                      }`}
                    >
                      {batch.status}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/track/${batch.id}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-emerald-500/20 dark:border-white/10 transition-colors"
                        title="View Traceability Passport"
                      >
                        <QrCode className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

    </div>
  );
}

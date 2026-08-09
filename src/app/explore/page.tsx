import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalProduceExplorer } from "@/components/landing/GlobalProduceExplorer";

export default function ExplorePage() {
  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <GlobalProduceExplorer />
      </main>

      <Footer />
    </div>
  );
}

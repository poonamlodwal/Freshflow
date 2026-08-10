import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FruitScrollIntro } from "@/components/landing/FruitScrollIntro";
import { HeroSection } from "@/components/landing/HeroSection";
import { LiveScanPreview } from "@/components/landing/LiveScanPreview";
import { GlobalProduceExplorer } from "@/components/landing/GlobalProduceExplorer";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { ModelAttributionCard } from "@/components/landing/ModelAttributionCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <FruitScrollIntro />
        <HeroSection />
        <LiveScanPreview />
        <GlobalProduceExplorer />
        <FeatureGrid />
        <ModelAttributionCard />
      </main>

      <Footer />
    </div>
  );
}

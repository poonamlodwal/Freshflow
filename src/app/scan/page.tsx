"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/scan/DropZone";
import { ScanVisualizer } from "@/components/scan/ScanVisualizer";
import { QualityReport } from "@/components/scan/QualityReport";
import { CameraModal } from "@/components/scan/CameraModal";
import { MOCK_SAMPLE_PRODUCE, SampleProduce } from "@/lib/mockData";
import { Sparkles, Scan, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const [selectedProduce, setSelectedProduce] = useState<SampleProduce>(MOCK_SAMPLE_PRODUCE[0]);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(MOCK_SAMPLE_PRODUCE[0].imageUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelectSample = (sample: SampleProduce) => {
    setIsScanning(true);
    setSelectedProduce(sample);
    setCurrentImageSrc(sample.imageUrl);

    // Simulate Server API route `/api/scan` call
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: sample.id })
    })
      .then((res) => res.json())
      .then(() => setIsScanning(false))
      .catch(() => setIsScanning(false));
  };

  const handleUploadFile = (file: File) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append("file", file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCurrentImageSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    fetch("/api/scan", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.analysis) {
          setSelectedProduce(data.analysis);
        }
        setIsScanning(false);
      })
      .catch(() => setIsScanning(false));
  };

  const handleCameraCapture = (capturedDataUrl: string) => {
    setIsScanning(true);
    setCurrentImageSrc(capturedDataUrl);

    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: capturedDataUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.analysis) {
          setSelectedProduce(data.analysis);
        }
        setIsScanning(false);
      })
      .catch(() => setIsScanning(false));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono mb-1">
              <Scan className="w-4 h-4" />
              <span>MODULE 02 • COMPUTER VISION DIAGNOSTIC</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Camera Scanner & <span className="text-emerald-600 dark:text-emerald-400">Quality Assessment</span>
            </h1>
          </div>

          <Link
            href="/marketplace"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900 border border-emerald-500/20 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 shadow-sm"
          >
            <span>View Marketplace</span>
            <ArrowLeft className="w-4 h-4 rotate-180 text-emerald-600 dark:text-emerald-400" />
          </Link>
        </div>

        {/* Drop Zone & Quick Selector */}
        <DropZone
          onSelectSample={handleSelectSample}
          onUploadFile={handleUploadFile}
          onOpenCamera={() => setIsCameraOpen(true)}
          selectedSampleId={selectedProduce.id}
        />

        {/* Main Grid: Live Scanner & Quality Report */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-6">
            <ScanVisualizer
              imageSrc={currentImageSrc}
              isScanning={isScanning}
              produceData={selectedProduce}
            />
          </div>

          <div className="lg:col-span-6">
            <QualityReport
              produce={selectedProduce}
              onSaveToERP={() => showToast(`Batch "${selectedProduce.name}" saved to ERP inventory!`)}
              onAutoListMarketplace={() => showToast(`Batch "${selectedProduce.name}" auto-listed on rescue marketplace!`)}
            />
          </div>

        </div>

      </main>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-900 dark:bg-emerald-950 border border-emerald-400 text-emerald-100 text-xs font-bold shadow-emerald-glow flex items-center gap-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <Footer />
    </div>
  );
}

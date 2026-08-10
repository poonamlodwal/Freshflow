"use client";

import React, { useState } from "react";
import { Upload, Camera, Sparkles, Image as ImageIcon, Check } from "lucide-react";
import { MOCK_SAMPLE_PRODUCE, SampleProduce } from "@/lib/mockData";

interface DropZoneProps {
  onSelectSample: (item: SampleProduce) => void;
  onUploadFile: (file: File) => void;
  onOpenCamera: () => void;
  selectedSampleId: string;
}

export function DropZone({
  onSelectSample,
  onUploadFile,
  onOpenCamera,
  selectedSampleId
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 glass-panel ${
          isDragging
            ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
            : "border-white/15 hover:border-emerald-500/40 bg-slate-950/60"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-emerald-glow">
            <Upload className="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-white">Drag & Drop Produce Image</h4>
            <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP up to 25MB • High-resolution macro photos recommended</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300">
              Browse Local Files
            </span>
            <span className="text-xs text-slate-500">or</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCamera();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-emerald-glow flex items-center gap-2 z-20"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Live Camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Select Sample Produce Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick Demo Samples (Click to Instant Scan)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">5 High-Res Presets</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MOCK_SAMPLE_PRODUCE.map((sample) => {
            const isSelected = sample.id === selectedSampleId;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className={`relative rounded-2xl overflow-hidden border text-left p-2.5 transition-all duration-200 glass-panel flex flex-col justify-between h-28 ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-950/60 shadow-emerald-glow scale-105"
                    : "border-white/10 hover:border-emerald-500/30 bg-slate-900/60"
                }`}
              >
                <div className="relative w-full h-14 rounded-xl overflow-hidden mb-2">
                  <img src={sample.imageUrl} alt={sample.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white truncate">{sample.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">{sample.freshnessScore}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

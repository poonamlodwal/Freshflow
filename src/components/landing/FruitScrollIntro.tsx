"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

const TOTAL_FRAMES = 250;
const FRAME_PATH_PREFIX = "/frames-fruit/ezgif-frame-";
const FRAME_PATH_SUFFIX = ".jpg";

export function FruitScrollIntro() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<number | null>(null);

  // Preload frames progressively
  useEffect(() => {
    let isCancelled = false;
    const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let count = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, "0");
      img.src = `${FRAME_PATH_PREFIX}${paddedIndex}${FRAME_PATH_SUFFIX}`;

      const handleLoad = () => {
        if (isCancelled) return;
        count++;
        setLoadedCount(count);
        // Mark as ready once first 15 frames are loaded so intro starts instantly
        if (count >= 15 && !isReady) {
          setIsReady(true);
        }
      };

      img.onload = handleLoad;
      img.onerror = handleLoad;
      loadedImages[i - 1] = img;
    }

    imagesRef.current = loadedImages;

    return () => {
      isCancelled = true;
    };
  }, []);

  // Draw frame onto canvas with cover aspect ratio
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const roundedIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(frameIndex))
    );

    const img = imagesRef.current[roundedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    lastDrawnFrameRef.current = roundedIndex;
  };

  // Canvas resize handling with HiDPI support
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      if (lastDrawnFrameRef.current !== null) {
        drawFrame(lastDrawnFrameRef.current);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll listening & RAF animation interpolation loop
  useEffect(() => {
    let running = true;

    const updateScrollProgress = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;
      if (totalScrollableHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(1, Math.max(0, scrolled / totalScrollableHeight));

      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    };

    const renderLoop = () => {
      if (!running) return;

      // Smooth frame interpolation (cinematic easing)
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.001) {
        currentFrameRef.current += diff * 0.12;
        drawFrame(currentFrameRef.current);
      } else if (lastDrawnFrameRef.current !== Math.round(targetFrameRef.current)) {
        currentFrameRef.current = targetFrameRef.current;
        drawFrame(currentFrameRef.current);
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    const handleScroll = () => {
      updateScrollProgress();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollProgress();
    renderLoop();

    return () => {
      running = false;
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isReady]);

  const loadPercentage = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <section ref={containerRef} className="relative h-[300vh] w-full bg-[#181015]">
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* High performance 2D Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: isReady ? 1 : 0 }}
        />

        {/* Initial Loading State */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181015] z-20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin-slow" />
              <span className="text-sm font-semibold tracking-wider text-emerald-300 uppercase">
                Loading Cinematic Fruit Experience...
              </span>
            </div>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/30">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-200"
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono">{loadPercentage}%</p>
          </div>
        )}

        {/* Seamless Radial & Edge Lighting Blends */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#181015]/80 via-[#181015]/30 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#181015] via-[#181015]/70 to-transparent pointer-events-none z-10" />

        {/* Scroll Action Prompt */}
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-8 z-20 flex flex-col items-center gap-2 pointer-events-none"
          >
            <div className="px-4 py-2 rounded-full bg-slate-950/80 border border-emerald-500/30 glass-pill backdrop-blur-md flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold text-emerald-300 tracking-wide">
                Scroll to Experience Freshness
              </span>
            </div>
            <ChevronDown className="w-5 h-5 text-emerald-400 animate-bounce mt-1 opacity-80" />
          </motion.div>
        )}
      </div>
    </section>
  );
}

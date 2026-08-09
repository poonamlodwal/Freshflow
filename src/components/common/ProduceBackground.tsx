"use client";

import React, { useEffect, useRef, useState } from "react";

interface ProduceItem {
  id: number;
  emoji: string;
  name: string;
  glowColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  depth: number; // 0.4 (background blur) to 1.0 (foreground)
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  sineOffset: number;
  sineSpeed: number;
  isScanning?: boolean;
  scanTimer?: number;
  badgeText?: string;
}

interface TechParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface ConnectionPulse {
  itemAIdx: number;
  itemBIdx: number;
  progress: number;
  speed: number;
}

const PRODUCE_CATALOG = [
  { emoji: "🍎", name: "Red Apple", glow: "rgba(239, 68, 68, 0.45)", badge: "Quality 99.4%" },
  { emoji: "🍊", name: "Fresh Orange", glow: "rgba(249, 115, 22, 0.45)", badge: "AI Checked" },
  { emoji: "🍅", name: "Ripened Tomato", glow: "rgba(248, 113, 113, 0.45)", badge: "✓ Fresh" },
  { emoji: "🥕", name: "Organic Carrot", glow: "rgba(251, 146, 60, 0.45)", badge: "Traceable" },
  { emoji: "🥦", name: "Fresh Broccoli", glow: "rgba(34, 197, 94, 0.45)", badge: "Grade A" },
  { emoji: "🥬", name: "Leafy Greens", glow: "rgba(74, 222, 128, 0.45)", badge: "Organic" },
  { emoji: "🥒", name: "Crisp Cucumber", glow: "rgba(52, 211, 153, 0.45)", badge: "✓ Fresh" },
  { emoji: "🍋", name: "Bright Lemon", glow: "rgba(250, 204, 21, 0.45)", badge: "98% Brix" },
  { emoji: "🍇", name: "Sweet Grapes", glow: "rgba(168, 85, 247, 0.45)", badge: "AI Checked" },
  { emoji: "🥔", name: "Farm Potato", glow: "rgba(217, 119, 6, 0.40)", badge: "Traceable" },
  { emoji: "🥭", name: "Alphonso Mango", glow: "rgba(251, 191, 36, 0.45)", badge: "Premium" },
  { emoji: "🥑", name: "Hass Avocado", glow: "rgba(16, 185, 129, 0.45)", badge: "Grade A" },
];

export function ProduceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isTabVisible = true;

    // Visibility Listener to pause animation loop when tab is hidden
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Mouse & Scroll Parallax State
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let scrollY = window.scrollY;

    const isMobile = window.innerWidth < 768;

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const width = canvas.width;
    const height = canvas.height;

    // Edge Spatial Helper: Keep central 48% clear for Hero content
    const getEdgeSpawnCoordinates = () => {
      const isHorizontalEdge = Math.random() > 0.25;
      let x: number, y: number;

      if (isHorizontalEdge) {
        // Top 26% or Bottom 26%
        y = Math.random() < 0.5 ? Math.random() * (height * 0.26) : height * 0.74 + Math.random() * (height * 0.26);
        x = Math.random() * width;
      } else {
        // Left 26% or Right 26%
        x = Math.random() < 0.5 ? Math.random() * (width * 0.26) : width * 0.74 + Math.random() * (width * 0.26);
        y = Math.random() * height;
      }
      return { x, y };
    };

    // Calculate density based on screen size (Mobile reduces density by ~60%)
    const produceCount = isMobile
      ? Math.min(12, Math.max(8, Math.floor(width / 75)))
      : Math.min(26, Math.max(16, Math.floor(width / 55)));

    const produceItems: ProduceItem[] = [];

    for (let i = 0; i < produceCount; i++) {
      const p = PRODUCE_CATALOG[i % PRODUCE_CATALOG.length];
      const coords = getEdgeSpawnCoordinates();
      const depth = Math.random() * 0.6 + 0.4;

      produceItems.push({
        id: i,
        emoji: p.emoji,
        name: p.name,
        glowColor: p.glow,
        badgeText: p.badge,
        x: coords.x,
        y: coords.y,
        vx: (Math.random() - 0.5) * 0.35 * depth,
        vy: (Math.random() - 0.5) * 0.35 * depth - 0.18 * depth,
        size: (Math.random() * 20 + 46) * depth,
        depth: depth,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008 * depth,
        alpha: (Math.random() * 0.25 + 0.40) * (depth * 0.8 + 0.2),
        sineOffset: Math.random() * Math.PI * 2,
        sineSpeed: Math.random() * 0.012 + 0.004,
        isScanning: false,
        scanTimer: 0,
      });
    }

    // AI Tech Micro-Particles (Pollen/Dust)
    const techParticlesCount = isMobile ? 12 : 28;
    const techParticles: TechParticle[] = [];
    for (let i = 0; i < techParticlesCount; i++) {
      techParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.25 - 0.08,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    // Dynamic Connection Pulses traveling between produce
    const pulses: ConnectionPulse[] = [];
    const triggerNewPulse = () => {
      if (produceItems.length < 2) return;
      const idxA = Math.floor(Math.random() * produceItems.length);
      let idxB = Math.floor(Math.random() * produceItems.length);
      if (idxA === idxB) idxB = (idxA + 1) % produceItems.length;

      pulses.push({
        itemAIdx: idxA,
        itemBIdx: idxB,
        progress: 0,
        speed: 0.015 + Math.random() * 0.015,
      });
    };

    const pulseInterval = setInterval(triggerNewPulse, 3500);

    // AI Scanning Ring Trigger (Occasional random item scan)
    const triggerScanRing = () => {
      if (produceItems.length === 0) return;
      const randomIdx = Math.floor(Math.random() * produceItems.length);
      produceItems[randomIdx].isScanning = true;
      produceItems[randomIdx].scanTimer = 180; // ~3 seconds @ 60fps
    };

    const scanInterval = setInterval(triggerScanRing, 5500);

    // Main 60fps Render Loop
    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse parallax interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      // 1. Draw AI Tech Micro-Particles (Pollen/Dust)
      techParticles.forEach((tp) => {
        if (!prefersReducedMotion) {
          tp.x += tp.vx;
          tp.y += tp.vy;
          if (tp.y < -10) tp.y = h + 10;
          if (tp.x < -10) tp.x = w + 10;
          if (tp.x > w + 10) tp.x = -10;
        }

        ctx.save();
        ctx.fillStyle = `rgba(52, 211, 153, ${tp.alpha})`;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Draw Faint AI Telemetry Connection Lines & Traveling Pulses
      for (let i = 0; i < produceItems.length; i++) {
        for (let j = i + 1; j < produceItems.length; j++) {
          const itemA = produceItems[i];
          const itemB = produceItems[j];

          const ax = itemA.x + (isMobile ? 0 : currentMouseX * itemA.depth * 15);
          const ay = itemA.y - scrollY * itemA.depth * 0.08 + (isMobile ? 0 : currentMouseY * itemA.depth * 15);
          const bx = itemB.x + (isMobile ? 0 : currentMouseX * itemB.depth * 15);
          const by = itemB.y - scrollY * itemB.depth * 0.08 + (isMobile ? 0 : currentMouseY * itemB.depth * 15);

          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const lineAlpha = (1 - dist / 180) * 0.16;
            ctx.save();
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Update and Draw Data Pulses traveling between produce
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const itemA = produceItems[pulse.itemAIdx];
        const itemB = produceItems[pulse.itemBIdx];

        if (itemA && itemB) {
          const ax = itemA.x + (isMobile ? 0 : currentMouseX * itemA.depth * 15);
          const ay = itemA.y - scrollY * itemA.depth * 0.08;
          const bx = itemB.x + (isMobile ? 0 : currentMouseX * itemB.depth * 15);
          const by = itemB.y - scrollY * itemB.depth * 0.08;

          const px = ax + (bx - ax) * pulse.progress;
          const py = ay + (by - ay) * pulse.progress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(52, 211, 153, 0.85)";
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
      }

      // 3. Render Produce Items with Depth, Parallax, and AI Scanning Ring Overlay
      produceItems.forEach((item) => {
        if (!prefersReducedMotion) {
          item.sineOffset += item.sineSpeed;
          const horizontalWave = Math.sin(item.sineOffset) * 0.3;

          item.x += item.vx + horizontalWave;
          item.y += item.vy;
          item.rotation += item.rotationSpeed;

          // Screen boundary wrap
          if (item.x < -100) item.x = w + 100;
          if (item.x > w + 100) item.x = -100;
          if (item.y < -100) item.y = h + 100;
          if (item.y > h + 100) item.y = -100;
        }

        // Apply mouse parallax & scroll-based vertical offset
        const parallaxX = item.x + (isMobile ? 0 : currentMouseX * item.depth * 18);
        const parallaxY = item.y - scrollY * item.depth * 0.10 + (isMobile ? 0 : currentMouseY * item.depth * 18);

        ctx.save();
        ctx.translate(parallaxX, parallaxY);
        ctx.rotate(item.rotation);

        // Soft ambient radial glow halo
        ctx.beginPath();
        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, item.size * 1.35);
        grad.addColorStop(0, item.glowColor);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.arc(0, 0, item.size * 1.35, 0, Math.PI * 2);
        ctx.fill();

        // Render produce emoji
        ctx.globalAlpha = item.alpha;
        ctx.font = `${item.size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.emoji, 0, 0);

        // AI Scanning Ring Micro-Animation Overlay
        if (item.isScanning && item.scanTimer) {
          item.scanTimer -= 1;
          const scanAlpha = Math.sin((item.scanTimer / 180) * Math.PI);

          // Pulsing Cyan/Emerald Ring
          ctx.strokeStyle = `rgba(16, 185, 129, ${scanAlpha * 0.75})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, item.size * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          // Transient Micro AI Data Badge
          if (item.badgeText && scanAlpha > 0.2) {
            ctx.save();
            ctx.globalAlpha = scanAlpha * 0.9;
            ctx.font = "bold 10px monospace";
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 6;
            ctx.fillText(item.badgeText, 0, item.size * 0.9 + 6);
            ctx.restore();
          }

          if (item.scanTimer <= 0) {
            item.isScanning = false;
          }
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateSize);
      clearInterval(pulseInterval);
      clearInterval(scanInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none z-[1] w-full h-full opacity-100 overflow-hidden"
    />
  );
}

export default ProduceBackground;

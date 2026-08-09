"use client";

import React, { useEffect, useRef } from "react";

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  glowColor: string;
  alpha: number;
}

const PRODUCE_EMOJIS = [
  { emoji: "🥭", glow: "rgba(255, 183, 77, 0.45)" }, // Alphonso Mango
  { emoji: "🍎", glow: "rgba(239, 83, 80, 0.45)" },  // Kashmiri Apple
  { emoji: "🥑", glow: "rgba(129, 199, 132, 0.45)" }, // Avocado
  { emoji: "🥝", glow: "rgba(167, 243, 208, 0.45)" }, // Kiwi
  { emoji: "🐉", glow: "rgba(244, 114, 182, 0.45)" }, // Dragon Fruit
  { emoji: "🥦", glow: "rgba(76, 175, 80, 0.45)" },   // Broccoli
  { emoji: "🫑", glow: "rgba(239, 83, 80, 0.45)" },  // Bell Pepper
  { emoji: "🍊", glow: "rgba(255, 167, 38, 0.45)" },  // Mandarin Orange
  { emoji: "🫐", glow: "rgba(147, 197, 253, 0.45)" }, // Blueberry
  { emoji: "🍍", glow: "rgba(253, 224, 71, 0.45)" },  // Pineapple
  { emoji: "🍓", glow: "rgba(248, 113, 113, 0.45)" }, // Strawberry
  { emoji: "🍇", glow: "rgba(192, 132, 252, 0.45)" }, // Grapes
];

export function ProduceCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Initialize 28 enlarged produce particles (40px to 62px)
    const particleCount = Math.min(28, Math.floor(width / 50));
    const particles: FloatingParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const item = PRODUCE_EMOJIS[i % PRODUCE_EMOJIS.length];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7 - 0.35, // Smooth floating drift
        size: Math.random() * 22 + 40, // 40px to 62px size
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        emoji: item.emoji,
        glowColor: item.glow,
        alpha: Math.random() * 0.2 + 0.3, // 0.30 to 0.50 opacity
      });
    }

    // 60fps Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Position updates
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Boundary wrap
        if (p.x < -80) p.x = width + 80;
        if (p.x > width + 80) p.x = -80;
        if (p.y < -80) p.y = height + 80;
        if (p.y > height + 80) p.y = -80;

        // Draw radial glowing halo
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(0, 0, 4, 0, 0, p.size * 1.3);
        gradient.addColorStop(0, p.glowColor);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.arc(0, 0, p.size * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Render produce emoji with 0.3 - 0.5 opacity
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-90"
    />
  );
}

export default ProduceCanvasBackground;

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

const PRODUCE_ICONS = ["🍑", "🍒", "🍎", "🥑", "🍓", "🍌", "🍋", "🥦", "🥕"];

interface Particle {
  id: number;
  x: number;
  y: number;
  icon: string;
}

export function DynamicFruitCursor() {
  const [iconIndex, setIconIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Motion values for smooth cursor tracking
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 500, damping: 28 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    // Cycle to next produce icon
    setIconIndex((prev) => (prev + 1) % PRODUCE_ICONS.length);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    // Spawn click particle burst
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      icon: PRODUCE_ICONS[(iconIndex + 1) % PRODUCE_ICONS.length],
    };

    setParticles((prev) => [...prev.slice(-6), newParticle]);
  }, [iconIndex]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const touchMedia = window.matchMedia("(pointer: coarse)");
      if (touchMedia.matches || "ontouchstart" in window) {
        setIsTouchDevice(true);
        return;
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") !== null ||
        target.closest("a") !== null ||
        target.getAttribute("role") === "button";

      setIsHovered(isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [cursorX, cursorY, isVisible, handleGlobalClick]);

  // Clean up old particles after animation
  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Click Particle Ripples */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.6, x: p.x - 12, y: p.y - 12 }}
            animate={{
              opacity: 0,
              scale: 1.8,
              y: p.y - 45,
              x: p.x + (Math.random() * 40 - 20),
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() => removeParticle(p.id)}
            className="fixed pointer-events-none z-50 text-base select-none"
          >
            {p.icon}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Primary Trailing Produce Cursor */}
      <motion.div
        style={{
          left: smoothX,
          top: smoothY,
        }}
        className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        {/* Glowing Pastel Ring Indicator */}
        <motion.div
          animate={{
            scale: isClicking ? 1.8 : isHovered ? 1.5 : 1,
            opacity: isHovered || isClicking ? 0.85 : 0.4,
          }}
          transition={{ duration: 0.15 }}
          className="w-10 h-10 rounded-full border-2 border-rose-400 dark:border-emerald-400 bg-rose-400/15 dark:bg-emerald-400/15 shadow-red-glow"
        />

        {/* Dynamic Produce Emoji Core */}
        <motion.span
          key={iconIndex}
          initial={{ scale: 0.7, rotate: -20 }}
          animate={{
            scale: isClicking ? 1.6 : isHovered ? 1.35 : 1,
            rotate: isClicking ? [0, 20, -20, 0] : isHovered ? [0, -10, 10, 0] : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute text-xl select-none filter drop-shadow-md"
        >
          {PRODUCE_ICONS[iconIndex]}
        </motion.span>
      </motion.div>
    </>
  );
}

export default DynamicFruitCursor;

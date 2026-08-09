"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Mouse position values
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs for trailing fluid motion
  const springConfig = { stiffness: 450, damping: 28 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if touch device / mobile screen
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

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <motion.div
      style={{
        left: smoothX,
        top: smoothY,
      }}
      className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
    >
      {/* Outer Glowing Ring Indicator */}
      <motion.div
        animate={{
          scale: isHovered ? 1.6 : 1,
          opacity: isHovered ? 0.8 : 0.4,
        }}
        transition={{ duration: 0.15 }}
        className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-500/10 shadow-emerald-glow"
      />

      {/* Produce Emoji Cursor Core */}
      <motion.span
        animate={{
          scale: isHovered ? 1.35 : 1,
          rotate: isHovered ? [0, -10, 10, 0] : 0
        }}
        transition={{ duration: 0.2 }}
        className="absolute text-xl select-none filter drop-shadow-lg"
      >
        🥑
      </motion.span>
    </motion.div>
  );
}

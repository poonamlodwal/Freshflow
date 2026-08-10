"use client";

import React, { useEffect, useState } from "react";
import { useSpring } from "framer-motion";

interface AnimatedCountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCountUp({ value, prefix = "", suffix = "", decimals = 0 }: AnimatedCountUpProps) {
  const spring = useSpring(0, { stiffness: 40, damping: 20 });
  const [displayValue, setDisplayValue] = useState<string>("0");

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest: number) => {
      setDisplayValue(Number(latest).toFixed(decimals));
    });
    return () => unsubscribe();
  }, [spring, decimals]);

  return (
    <span className="font-mono font-extrabold">
      {prefix}
      {Number(displayValue).toLocaleString()}
      {suffix}
    </span>
  );
}

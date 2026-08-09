"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Scan, 
  Store, 
  LayoutDashboard, 
  QrCode, 
  Menu, 
  X, 
  ChevronRight, 
  Cpu, 
  Leaf,
  Globe,
  Sun,
  Moon
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check initial theme or saved preference
    const savedTheme = localStorage.getItem("freshflow-theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("freshflow-theme", "light");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("freshflow-theme", "dark");
    }
  };

  const navItems = [
    { name: "Home", href: "/", icon: Leaf },
    { name: "Global Produce", href: "/explore", icon: Globe },
    { name: "AI Scanner", href: "/scan", icon: Scan },
    { name: "Marketplace", href: "/marketplace", icon: Store },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tracker", href: "/track/BATCH-8901", icon: QrCode },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/20 glass-panel backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 p-[1px] shadow-emerald-glow transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-emerald-950 dark:bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                Fresh<span className="text-emerald-500 dark:text-emerald-400">Flow</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-md uppercase tracking-wider">
                AI v4.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Produce Traceability & Rescue</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-full border border-emerald-500/20 dark:border-white/10 glass-panel">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href.startsWith("/track") && pathname.startsWith("/track"));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 rounded-full shadow-emerald-glow -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Status Pill & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-emerald-500/20 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm active:scale-105"
            title={isDarkMode ? "Switch to Light Soft Mint Theme" : "Switch to Dark Midnight Theme"}
            aria-label="Toggle Theme Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
          </button>


          <div className="relative hidden sm:flex lg:hidden xl:flex group">
  <button
    type="button"
    disabled
    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-xs shadow-emerald-glow transition-all opacity-90 cursor-not-allowed"
  >
    Sign In
  </button>

  <div className="absolute top-full right-0 mt-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-lg border border-emerald-500/20">
  Coming Soon
</div>
</div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-emerald-500/20 dark:border-white/10 text-slate-700 dark:text-slate-300"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-emerald-500/20 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
                      : "text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
            
            <div className="pt-2">
              <Link
                href="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-emerald-glow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Camera Scanner</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ProduceBackground from "@/components/common/ProduceBackground";
import DynamicFruitCursor from "@/components/common/DynamicFruitCursor";
import FreshFlowLoader from "@/components/common/FreshFlowLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FreshFlow — Global Produce Quality, Traceability & Marketplace Platform",
  description: "Zero Food Waste. 100% Traceable. Exhaustive Global Produce Explorer featuring 30+ fruit & vegetable varieties spanning India and international origins.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="relative min-h-screen bg-[#FFF8F6] dark:bg-[#181015] text-[#2C1E21] dark:text-[#F8FAFC] overflow-x-hidden flex flex-col selection:bg-rose-500 selection:text-white">
        {/* Premium Splash Loader */}
        <FreshFlowLoader />

        {/* Dedicated 60fps Floating Produce Background Layer */}
        <ProduceBackground />

        {/* Dynamic Interactive Produce Cursor Layer */}
        <DynamicFruitCursor />

        {/* Page Content Layer */}
        <div className="relative z-10 min-h-screen flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

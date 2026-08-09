import { NextResponse } from "next/server";
import { MOCK_ERP_STATS, MOCK_AI_SUGGESTIONS, MOCK_MARKETPLACE_BATCHES } from "@/lib/mockData";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  let stats = MOCK_ERP_STATS;
  let suggestions = MOCK_AI_SUGGESTIONS;
  let inventory = MOCK_MARKETPLACE_BATCHES;

  try {
    const [statsRes, invRes, sugRes] = await Promise.allSettled([
      fetch(`${FASTAPI_URL}/erp/stats`, { cache: "no-store" }),
      fetch(`${FASTAPI_URL}/erp/inventory`, { cache: "no-store" }),
      fetch(`${FASTAPI_URL}/erp/suggestions`, { cache: "no-store" }),
    ]);

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const data = await statsRes.value.json();
      stats = {
        totalBatchesTracked: data.totalBatchesScanned || MOCK_ERP_STATS.totalBatchesTracked,
        freshnessRatioPercent: data.freshnessIndexRatio || MOCK_ERP_STATS.freshnessRatioPercent,
        totalWastePreventedKg: data.estimatedWasteSavedKg || MOCK_ERP_STATS.totalWastePreventedKg,
        salvagedRevenueUsd: data.salvagedRevenueUsd || MOCK_ERP_STATS.salvagedRevenueUsd,
        activeAlertsCount: MOCK_ERP_STATS.activeAlertsCount,
        huggingFaceModelVersion: MOCK_ERP_STATS.huggingFaceModelVersion,
        inferenceLatencyMs: MOCK_ERP_STATS.inferenceLatencyMs,
      };
    }

    if (invRes.status === "fulfilled" && invRes.value.ok) {
      const data = await invRes.value.json();
      if (Array.isArray(data) && data.length > 0) {
        inventory = data.map((item: any, idx: number) => {
          const pType = item.produceType || "apple";
          const status = item.freshStatus || "fresh";
          return {
            id: item.batchId || `BATCH-${1000 + idx}`,
            name: `Organic ${pType.charAt(0).toUpperCase() + pType.slice(1)}`,
            category: ["apple", "banana", "orange", "strawberry", "grape"].includes(pType.toLowerCase())
              ? "Fruits"
              : "Vegetables",
            farmName: "Sunrise Agro Cooperative",
            location: "Sonoma Valley, CA",
            farmerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            grade: status === "fresh" ? "Grade A (Pristine)" : "Grade B (Minor Blemish)",
            freshnessScore: Math.round((item.confidence || 0.9) * 100),
            expiryDaysRemaining: item.estimatedShelfLifeDays ?? 3,
            quantityKg: item.quantity || 50,
            originalPricePerKg: 3.5,
            discountedPricePerKg: 2.2,
            aiConfidence: item.confidence || 0.9,
            harvestDate: item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : "2026-08-08",
            certHash: `0x${(item.batchId || "hash").slice(0, 16)}...`,
            imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
            co2SavedKg: 90,
            status: item.status === "listed" ? "Listed" : "Harvested",
            defects: [status === "fresh" ? "No major defects" : "Minor surface blemish"],
          };
        });
      }
    }

    if (sugRes.status === "fulfilled" && sugRes.value.ok) {
      const data = await sugRes.value.json();
      if (Array.isArray(data) && data.length > 0) {
        suggestions = data.map((s: any) => ({
          id: s.id || `sug-${Date.now()}`,
          severity: s.action?.includes("List") ? "urgent" : "warning",
          title: `Action Item for Batch ${s.batchId ? s.batchId.slice(0, 8) : "Produce"}`,
          message: s.reason || "Near-expiry batch requires immediate action.",
          recommendation: s.action || "List on marketplace",
          actionText: s.action || "Auto-List",
          batchId: s.batchId || "BATCH-8901",
        }));
      }
    }
  } catch (err) {
    console.warn("FastAPI ERP fetch failed, using fallback mock data:", err);
  }

  return NextResponse.json({
    success: true,
    stats,
    suggestions,
    inventory,
  });
}

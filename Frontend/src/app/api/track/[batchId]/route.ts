import { NextRequest, NextResponse } from "next/server";
import { MOCK_MARKETPLACE_BATCHES, MOCK_TIMELINE_EVENTS, ProduceBatch } from "@/lib/mockData";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params;
  const upperBatchId = batchId.toUpperCase();

  let batchData: ProduceBatch | null = null;

  try {
    const res = await fetch(`${FASTAPI_URL}/batches/${batchId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const pType = data.produceType || "Produce";
      batchData = {
        id: data.id,
        name: `Organic ${pType.charAt(0).toUpperCase() + pType.slice(1)}`,
        category: ["apple", "banana", "orange", "strawberry", "grape"].includes(pType.toLowerCase())
          ? "Fruits"
          : "Vegetables",
        farmName: "Sunrise Agro Cooperative",
        location: "Sonoma Valley, CA",
        farmerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        grade: data.freshStatus === "fresh" ? "Grade A (Pristine)" : "Grade B (Minor Blemish)",
        freshnessScore: Math.round((data.confidence || 0.9) * 100),
        expiryDaysRemaining: data.estimatedShelfLifeDays ?? 3,
        quantityKg: 50,
        originalPricePerKg: 3.5,
        discountedPricePerKg: 2.2,
        aiConfidence: data.confidence || 0.9,
        harvestDate: data.createdAt ? new Date(data.createdAt).toISOString().split("T")[0] : "2026-08-08",
        certHash: `0x${data.id.replace(/-/g, "").slice(0, 16)}...`,
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
        co2SavedKg: 90,
        status: "Listed",
        defects: ["Verified via Public QR Passport"],
      };
    }
  } catch (err) {
    console.warn(`FastAPI fetch for batch ${batchId} failed:`, err);
  }

  if (!batchData) {
    batchData =
      MOCK_MARKETPLACE_BATCHES.find((b) => b.id.toUpperCase() === upperBatchId) || {
        ...MOCK_MARKETPLACE_BATCHES[0],
        id: upperBatchId,
      };
  }

  const events = MOCK_TIMELINE_EVENTS[upperBatchId] || MOCK_TIMELINE_EVENTS["BATCH-8901"];

  return NextResponse.json({
    success: true,
    batch: batchData,
    timeline: events,
  });
}

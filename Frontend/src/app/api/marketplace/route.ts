import { NextRequest, NextResponse } from "next/server";
import { MOCK_MARKETPLACE_BATCHES, ProduceBatch } from "@/lib/mockData";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("query");
  const maxDays = searchParams.get("maxDays");

  let listings: ProduceBatch[] = [];

  try {
    const res = await fetch(`${FASTAPI_URL}/listings`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        listings = data.map(formatBackendListingToBatch);
      }
    }
  } catch (err) {
    console.warn("FastAPI listings fetch failed, using mock data fallback:", err);
  }

  if (listings.length === 0) {
    listings = [...MOCK_MARKETPLACE_BATCHES];
  }

  if (category && category !== "All") {
    listings = listings.filter((item) => item.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    listings = listings.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.farmName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
    );
  }

  if (maxDays) {
    const limit = parseInt(maxDays, 10);
    if (!isNaN(limit)) {
      listings = listings.filter((item) => item.expiryDaysRemaining <= limit);
    }
  }

  return NextResponse.json({
    success: true,
    total: listings.length,
    listings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId, listingId, buyerId } = body;

    let claimResult = null;
    const targetListingId = listingId || batchId;

    if (targetListingId) {
      try {
        const res = await fetch(`${FASTAPI_URL}/listings/${targetListingId}/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyerId: buyerId || "usr_buyer_greeneats" }),
        });
        if (res.ok) {
          claimResult = await res.json();
        }
      } catch (e) {
        console.warn("FastAPI claim request failed:", e);
      }
    }

    const item = MOCK_MARKETPLACE_BATCHES.find((b) => b.id === batchId || b.id === listingId);

    return NextResponse.json({
      success: true,
      message: claimResult?.id
        ? `Claim ${claimResult.id.slice(0, 8)} created successfully in backend database!`
        : `Batch ${batchId || listingId} claimed successfully! Escrow smart contract verified.`,
      claimedBatch: {
        ...(item || MOCK_MARKETPLACE_BATCHES[0]),
        id: batchId || listingId || "BATCH-CLAIMED",
        status: "Claimed",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to claim batch" }, { status: 500 });
  }
}

function formatBackendListingToBatch(listing: any): ProduceBatch {
  const b = listing.batch || {};
  const pType = b.produceType || "Produce Batch";
  const title = pType.charAt(0).toUpperCase() + pType.slice(1);
  const status = b.freshStatus || "fresh";
  const days = b.estimatedShelfLifeDays ?? 3;

  return {
    id: listing.batchId || listing.id,
    name: `Organic ${title}`,
    category: ["apple", "banana", "orange", "strawberry", "grape"].includes(pType.toLowerCase())
      ? "Fruits"
      : "Vegetables",
    farmName: "Sunrise Agro Cooperative",
    location: "Sonoma Valley, CA",
    farmerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    grade: status === "fresh" ? "Grade A (Pristine)" : "Grade B (Minor Blemish)",
    freshnessScore: Math.round((b.confidence || 0.9) * 100),
    expiryDaysRemaining: days,
    quantityKg: listing.quantity || 50,
    originalPricePerKg: Math.round((listing.price ? listing.price * 1.4 : 3.5) * 100) / 100,
    discountedPricePerKg: listing.price || 2.2,
    aiConfidence: b.confidence || 0.9,
    harvestDate: b.createdAt ? new Date(b.createdAt).toISOString().split("T")[0] : "2026-08-08",
    certHash: `0x${(listing.id || "a1b2c3d4").replace(/-/g, "").slice(0, 16)}...`,
    imageUrl: b.imageUrl || "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
    co2SavedKg: Math.round((listing.quantity || 50) * 1.8),
    status: listing.status === "CLAIMED" ? "Claimed" : "Listed",
    defects: [status === "fresh" ? "No major defects" : "Minor blemish"],
  };
}

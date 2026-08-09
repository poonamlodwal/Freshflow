import { NextRequest, NextResponse } from "next/server";
import { MOCK_MARKETPLACE_BATCHES } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("query");
  const maxDays = searchParams.get("maxDays");

  let result = [...MOCK_MARKETPLACE_BATCHES];

  if (category && category !== "All") {
    result = result.filter((item) => item.category === category);
  }

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.farmName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
    );
  }

  if (maxDays) {
    const limit = parseInt(maxDays, 10);
    if (!isNaN(limit)) {
      result = result.filter((item) => item.expiryDaysRemaining <= limit);
    }
  }

  return NextResponse.json({
    success: true,
    total: result.length,
    listings: result
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId } = body;

    const item = MOCK_MARKETPLACE_BATCHES.find((b) => b.id === batchId);
    if (!item) {
      return NextResponse.json({ success: false, error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Batch ${batchId} claimed successfully! Escrow smart contract verified.`,
      claimedBatch: {
        ...item,
        status: "Claimed"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to claim batch" }, { status: 500 });
  }
}

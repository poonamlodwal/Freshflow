import { NextRequest, NextResponse } from "next/server";
import { MOCK_MARKETPLACE_BATCHES, MOCK_TIMELINE_EVENTS } from "@/lib/mockData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params;
  const batch = MOCK_MARKETPLACE_BATCHES.find((b) => b.id.toUpperCase() === batchId.toUpperCase());
  const events = MOCK_TIMELINE_EVENTS[batchId.toUpperCase()] || MOCK_TIMELINE_EVENTS["BATCH-8901"];

  if (!batch) {
    // Return fallback passport with default details if unknown batch ID
    const defaultBatch = MOCK_MARKETPLACE_BATCHES[0];
    return NextResponse.json({
      success: true,
      batch: { ...defaultBatch, id: batchId.toUpperCase() },
      timeline: MOCK_TIMELINE_EVENTS["BATCH-8901"]
    });
  }

  return NextResponse.json({
    success: true,
    batch,
    timeline: events
  });
}

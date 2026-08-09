import { NextResponse } from "next/server";
import { MOCK_ERP_STATS, MOCK_AI_SUGGESTIONS, MOCK_MARKETPLACE_BATCHES } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    success: true,
    stats: MOCK_ERP_STATS,
    suggestions: MOCK_AI_SUGGESTIONS,
    inventory: MOCK_MARKETPLACE_BATCHES
  });
}

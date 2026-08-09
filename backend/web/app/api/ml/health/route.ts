import { NextResponse } from "next/server";
import { fetchMLHealth } from "@/lib/ml-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchMLHealth();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to connect to ML service";

    return NextResponse.json(
      {
        status: "error",
        error: message,
        model_loaded: false,
        model_id: "unknown",
        uptime_seconds: 0,
        env: "unknown",
      },
      { status: 503 }
    );
  }
}

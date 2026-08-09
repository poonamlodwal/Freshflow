import { NextRequest, NextResponse } from "next/server";
import { MOCK_SAMPLE_PRODUCE } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sampleId, produceName } = body;

    // Simulate Hugging Face Vision Transformer Model inference latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    let matchedProduce = MOCK_SAMPLE_PRODUCE.find(
      (p) => p.id === sampleId || p.name.toLowerCase().includes((produceName || "").toLowerCase())
    );

    if (!matchedProduce) {
      matchedProduce = MOCK_SAMPLE_PRODUCE[0]; // fallback to Honeycrisp Apple
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      modelAttribution: {
        engine: "Hugging Face ML Engine",
        modelName: "ViT-Produce-v4.2-Precision",
        latencyMs: 42,
        device: "WebGPU / Cloud Inference Proxy"
      },
      analysis: matchedProduce
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}

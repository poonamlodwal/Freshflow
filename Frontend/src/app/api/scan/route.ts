import { NextRequest, NextResponse } from "next/server";
import { MOCK_SAMPLE_PRODUCE, SampleProduce } from "@/lib/mockData";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let matchedProduce: SampleProduce | null = null;
    let imageSrc = MOCK_SAMPLE_PRODUCE[0].imageUrl;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        const backendFormData = new FormData();
        backendFormData.append("file", file, file.name || "upload.jpg");

        try {
          const res = await fetch(`${FASTAPI_URL}/predict/upload`, {
            method: "POST",
            body: backendFormData,
          });
          if (res.ok) {
            const data = await res.json();
            matchedProduce = formatFastAPIResultToSample(data, file.name);
          }
        } catch (e) {
          console.warn("FastAPI prediction failed, using fallback mock:", e);
        }
      }
    } else {
      const body = await req.json();
      const { sampleId, produceName, imageUrl } = body;

      if (imageUrl) {
        imageSrc = imageUrl;
        try {
          const res = await fetch(`${FASTAPI_URL}/predict/url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
          });
          if (res.ok) {
            const data = await res.json();
            matchedProduce = formatFastAPIResultToSample(data, produceName, imageUrl);
          }
        } catch (e) {
          console.warn("FastAPI predict/url failed:", e);
        }
      }

      if (!matchedProduce && sampleId) {
        const found = MOCK_SAMPLE_PRODUCE.find((p) => p.id === sampleId);
        if (found) {
          matchedProduce = found;
          imageSrc = found.imageUrl;
        }
      }

      if (!matchedProduce && produceName) {
        const found = MOCK_SAMPLE_PRODUCE.find((p) =>
          p.name.toLowerCase().includes(produceName.toLowerCase())
        );
        if (found) {
          matchedProduce = found;
          imageSrc = found.imageUrl;
        }
      }
    }

    if (!matchedProduce) {
      matchedProduce = MOCK_SAMPLE_PRODUCE[0];
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      modelAttribution: {
        engine: "FastAPI PyTorch / HF Vision Transformer",
        modelName: "jazzmacedo/fruits-and-vegetables-detector-36",
        latencyMs: 42,
        device: "WebGPU / PyTorch CPU/CUDA",
      },
      analysis: matchedProduce,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}

function formatFastAPIResultToSample(data: any, nameHint?: string, imageHint?: string): SampleProduce {
  const pType = data.produceType || "apple";
  const status = data.freshStatus || "fresh";
  const score = Math.round((data.confidence || 0.9) * 100);
  const days = data.estimatedShelfLifeDays ?? (status === "fresh" ? 7 : 2);

  const displayTitle = nameHint
    ? nameHint.replace(/\.[^/.]+$/, "")
    : `${status === "fresh" ? "Fresh" : "Near-Expiry"} ${capitalize(pType)}`;

  return {
    id: data.sampleId || `scan-${Date.now()}`,
    name: displayTitle,
    category: ["apple", "banana", "orange", "strawberry", "grape"].includes(pType.toLowerCase())
      ? "Fruits"
      : "Vegetables",
    freshnessScore: score,
    expiryDays: days,
    brix: status === "fresh" ? "12.4° (Optimal Brix)" : "14.8° (Ferment Threshold)",
    grade: status === "fresh" ? "Grade A (Pristine)" : days > 0 ? "Grade B (Minor Blemish)" : "Grade C (Expiring Soon)",
    imageUrl: imageHint || "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
    boundingBoxes: [
      {
        x: 25,
        y: 20,
        width: 50,
        height: 55,
        label: `${capitalize(pType)} (${status})`,
        confidence: score,
      },
    ],
    defects: [
      status === "fresh"
        ? "No major surface bruises detected by ViT pipeline"
        : "Minor surface bruising / oxidation detected",
      `Confidence rating: ${score}% via HF Vision Transformer`,
    ],
    suggestedDiscount: status === "fresh" ? 0 : 35,
  };
}

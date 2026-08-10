/**
 * Server-side helper to communicate with the FastAPI ML Service.
 *
 * NOTE: This file must only be called from server-side code (Server Components,
 * Server Actions, or API Routes) to prevent exposing internal infrastructure
 * or triggering CORS issues in the browser.
 */

export interface HealthResponse {
  status: "ok" | "degraded" | "error" | string;
  modelLoaded?: boolean;
  model_loaded?: boolean;
  modelId?: string;
  model_id?: string;
  phase?: string;
  uptime_seconds?: number;
  env?: string;
}

export interface PredictResponse {
  produceType: string;
  freshStatus: "fresh" | "expiring" | "rotten" | string;
  confidence: number;
  estimatedShelfLifeDays: number;
  isNearExpiry?: boolean;
  modelId?: string;
  rawLabel?: string;
  sampleId?: number;
}

const getBaseUrl = () => process.env.ML_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || "https://freshflow-uzv9.onrender.com";

/**
 * Fetch health status from the ML service.
 */
export async function fetchMLHealth(): Promise<HealthResponse> {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/health`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ML service returned HTTP status ${response.status}`);
  }

  return response.json();
}

/**
 * Run Hugging Face model prediction from image URL.
 */
export async function predictFromURL(imageUrl: string): Promise<PredictResponse> {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/predict/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ML predict/url returned HTTP status ${response.status}`);
  }

  return response.json();
}

/**
 * Run Hugging Face model prediction from image upload.
 */
export async function predictFromUpload(formData: FormData): Promise<PredictResponse> {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/predict/upload`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ML predict/upload returned HTTP status ${response.status}`);
  }

  return response.json();
}


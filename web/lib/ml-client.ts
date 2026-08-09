/**
 * Server-side helper to communicate with the FastAPI ML Service.
 *
 * NOTE: This file must only be called from server-side code (Server Components,
 * Server Actions, or API Routes) to prevent exposing internal infrastructure
 * or triggering CORS issues in the browser.
 */

export interface HealthResponse {
  status: "ok" | "degraded" | "error" | string;
  model_loaded: boolean;
  model_id: string;
  uptime_seconds: number;
  env: string;
}

export interface PredictResponse {
  produceType: string;
  freshStatus: "fresh" | "rotten" | string;
  confidence: number;
  estimatedShelfLifeDays: number;
}

/**
 * Fetch health status from the ML service.
 */
export async function fetchMLHealth(): Promise<HealthResponse> {
  const baseUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

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

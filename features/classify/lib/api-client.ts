import { classificationSchema } from "@/features/classify/schemas/classification-schema";
import type { ClassifyArtworkResult } from "@/features/classify/types";
import { describeAnalysisError } from "@/lib/analysis-errors";
import { normalizePredictions } from "./normalize-predictions";

/**
 * Direct browser → backend transport for artwork genre classification.
 *
 * Server Actions route the request body through the Next.js server, which on
 * Vercel is capped at a 4.5 MB function payload (`FUNCTION_PAYLOAD_TOO_LARGE`);
 * posting the file straight to the FastAPI backend from the browser bypasses
 * that cap (CORS preflight verified for `/classify/`).
 */
export async function classifyArtworkFile(
  file: File,
): Promise<ClassifyArtworkResult> {
  const parsed = classificationSchema.safeParse({ file });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Invalid classification request.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;
  if (!baseUrl) {
    return {
      success: false,
      message:
        "Classification service URL is not configured in the environment.",
    };
  }

  const formData = new FormData();
  formData.append("file", parsed.data.file);

  try {
    const response = await fetch(`${baseUrl}/classify/`, {
      method: "POST",
      body: formData,
      cache: "no-store",
      // Classification runs on CPU and can take a while on HF; allow 90s.
      signal: AbortSignal.timeout(90_000),
    });

    if (!response.ok) {
      // Guard against HTML error pages from HF proxy
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.slice(0, 200)}`);
      }

      const payload = await response.json();
      throw new Error(
        typeof payload?.detail === "string"
          ? payload.detail
          : `Server error (${response.status})`,
      );
    }

    const predictions = normalizePredictions(await response.json());

    if (predictions.length === 0) {
      return {
        success: false,
        message: "The classifier returned no usable genre predictions.",
      };
    }

    return {
      success: true,
      message: "Genre classification completed successfully.",
      predictions,
    };
  } catch (err) {
    // Transport failures are mapped to actionable guidance; backend detail
    // messages pass through verbatim.
    return { success: false, message: describeAnalysisError(err) };
  }
}

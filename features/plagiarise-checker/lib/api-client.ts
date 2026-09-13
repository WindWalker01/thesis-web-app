import type { CompareResponse } from "@/features/plagiarise-checker/types";

/**
 * Direct browser → backend transport for the two-image "Direct Comparison".
 *
 * The previous transport shipped both image files through a Next.js Server
 * Action. On serverless hosts (e.g. Vercel) that path is capped by the
 * platform's function request-body limit (~4.5 MB, `FUNCTION_PAYLOAD_TOO_LARGE`),
 * which larger image pairs exceed regardless of `serverActions.bodySizeLimit` —
 * the edge rejects the request before the action runs, and Next's client
 * surfaces it as "An unexpected response was received from the server."
 *
 * Posting the files straight to the FastAPI backend from the browser bypasses
 * that cap: the backend's `/plagiarism/compare` endpoint allows cross-origin
 * uploads (verified via CORS preflight), so image pairs of any supported size
 * can be compared in production.
 */
export async function checkPlagiarismCompareFiles(
  file1: File,
  file2: File,
): Promise<CompareResponse> {
  const apiBase = process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;
  if (!apiBase) {
    throw new Error("Plagiarism API URL is not configured.");
  }

  const formData = new FormData();
  formData.append("file1", file1);
  formData.append("file2", file2);

  const response = await fetch(`${apiBase}/plagiarism/compare`, {
    method: "POST",
    body: formData,
    // Backend may read large images; allow 90s like web-mode checks.
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    // Guard against HTML error pages from HF proxy
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Server error (${response.status}): ${text.slice(0, 200)}`);
    }

    const error = await response.json();
    throw new Error(error.detail ?? "Failed to compare images");
  }

  return response.json();
}

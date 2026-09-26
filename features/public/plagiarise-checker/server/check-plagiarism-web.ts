"use server";

import { enrichWebMatches } from "@/features/plagiarise-checker/server/enrich-web-matches";
import type {
  SearchResponse,
  PlagiarismWebResult,
} from "@/features/plagiarise-checker/types";

const API_BASE = process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;

/**
 * Server action: submit a file for web plagiarism checking.
 *
 * Calls the external API, then enriches any DB match (UUID) with the
 * Cloudinary image URL and artwork title from Supabase.
 */
export async function checkPlagiarismWeb(
  prevState: unknown,
  formData: FormData,
): Promise<{ success: boolean; data?: SearchResponse; error?: string }> {
  try {
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return { success: false, error: "No file provided." };
    }

    const res = await fetch(`${API_BASE}/plagiarism/check/web`, {
      method: "POST",
      body: formData,
      // Backend may poll Cloudinary readiness (up to ~15s extra); allow 90s.
      signal: AbortSignal.timeout(90_000),
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      return {
        success: false,
        error: detail?.detail ?? `Server error: ${res.status}`,
      };
    }

    const data: PlagiarismWebResult = await res.json();

    if (!data.success) {
      return { success: false, error: "Plagiarism check was not successful." };
    }

    // ── Enrich DB matches via the JSON-only server action (shared with the
    // browser-direct web path) ──
    const enriched = await enrichWebMatches({
      filename: data.filename,
      success: data.success,
      original_hash: data.original_hash,
      hashes: data.hashes,
      db: data.db ?? null,
      web: data.web ?? null,
      best_match: data.best_match ?? null,
      other_matches: data.other_matches ?? [],
      low_content_warning: data.low_content_warning,
      // Additive backend fields: pass through; tolerate legacy responses.
      web_warning: data.web_warning ?? null,
      web_diagnostics: data.web_diagnostics ?? undefined,
    });

    return { success: true, data: enriched };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
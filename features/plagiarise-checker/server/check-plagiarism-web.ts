"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SearchResponse, PlagiarismWebResult } from "@/features/plagiarise-checker/types";

const API_BASE = process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL;

interface ResolvedDbInfo {
  imageUrl: string | null;
  title: string | null;
}

async function resolveDbArtworkById(artworkId: string): Promise<ResolvedDbInfo | null> {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("registered_arts")
      .select("id, title, c_secure_url")
      .eq("id", artworkId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      imageUrl: data.c_secure_url ?? null,
      title: data.title,
    };
  } catch {
    return null;
  }
}

function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

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

    // ── Enrich DB match: resolve UUID → Cloudinary imageUrl + title ──
    const otherMatches = (data.other_matches ?? []).map(async (m) => {
      if (m.artwork_id && isUuidLike(m.artwork_id)) {
        const resolved = await resolveDbArtworkById(m.artwork_id);
        if (resolved) {
          return { ...m, url: resolved.imageUrl ?? m.url, link: resolved.imageUrl ?? m.link };
        }
      }
      return m;
    });

    const resolvedOtherMatches = await Promise.all(otherMatches);

    const enriched: SearchResponse = {
      filename: data.filename,
      success: data.success,
      original_hash: data.original_hash,
      hashes: data.hashes,
      db: data.db ?? null,
      web: data.web ?? null,
      best_match: data.best_match ?? null,
      other_matches: resolvedOtherMatches,
    };

    if (enriched.db?.type === "database" && isUuidLike(enriched.db.url)) {
      const resolved = await resolveDbArtworkById(enriched.db.url);
      if (resolved) {
        enriched.db = { ...enriched.db, imageUrl: resolved.imageUrl, title: resolved.title };
        if (enriched.best_match?.type === "database") {
          enriched.best_match = { ...enriched.best_match, imageUrl: resolved.imageUrl, title: resolved.title };
        }
      }
    }

    return { success: true, data: enriched };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
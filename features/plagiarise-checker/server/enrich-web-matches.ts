"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SearchResponse } from "@/features/plagiarise-checker/types";

function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveDbArtworkById(artworkId: string) {
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

/**
 * Server action: enrich a web-check result with Cloudinary image URLs and
 * artwork titles for database matches (UUID → Supabase lookup).
 *
 * The payload is JSON-only — it never receives file bytes — so it cannot hit
 * serverless request-body caps and is safe to call directly from the browser
 * after a browser-direct upload to the analysis backend.
 */
export async function enrichWebMatches(
  result: SearchResponse,
): Promise<SearchResponse> {
  // ── Enrich DB matches: resolve UUID → Cloudinary imageUrl + title ──
  const otherMatches = (result.other_matches ?? []).map(async (m) => {
    if (m.artwork_id && isUuidLike(m.artwork_id)) {
      const resolved = await resolveDbArtworkById(m.artwork_id);
      if (resolved) {
        return {
          ...m,
          url: resolved.imageUrl ?? m.url,           // Image URL for <Image> display
          link: m.link ?? resolved.imageUrl ?? m.url // Keep original link, fallback to imageUrl
        };
      }
    }
    return m;
  });

  const enriched: SearchResponse = {
    ...result,
    other_matches: await Promise.all(otherMatches),
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

  return enriched;
}

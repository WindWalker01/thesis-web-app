"use server";

import type { SearchResponse } from "@/features/public/plagiarise-checker/types";
import {
  isUuidLike,
  resolveDbArtworkById,
} from "@/features/public/plagiarise-checker/server/resolve-db-artwork";

/**
 * Server action: enrich a web-check result with artwork metadata for
 * database matches (UUID -> Supabase lookup: image URL, title, author,
 * registration date, status, license and public community post URL).
 *
 * The payload is JSON-only — it never receives file bytes — so it cannot hit
 * serverless request-body caps and is safe to call directly from the browser
 * after a browser-direct upload to the analysis backend.
 */
export async function enrichWebMatches(
  result: SearchResponse,
): Promise<SearchResponse> {
  // ── Enrich DB matches: resolve UUID -> Cloudinary imageUrl + title ──
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
      const dbDetails = {
        imageUrl: resolved.imageUrl,
        title: resolved.title,
        authorName: resolved.authorName,
        registeredAt: resolved.registeredAt,
        status: resolved.status,
        licenseName: resolved.licenseName,
        communityUrl: resolved.communityUrl,
      };
      enriched.db = { ...enriched.db, ...dbDetails };
      if (enriched.best_match?.type === "database") {
        enriched.best_match = { ...enriched.best_match, ...dbDetails };
      }
    }
  }

  return enriched;
}
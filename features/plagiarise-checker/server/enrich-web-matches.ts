"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SearchResponse } from "@/features/plagiarise-checker/types";

function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/** Artwork metadata resolved from Supabase for a registered (DB) match. */
export type ResolvedDbArtwork = {
  imageUrl: string | null;
  title: string;
  /** Owner display name: full name when available, else username. */
  authorName: string | null;
  /** ISO timestamp of when the artwork was registered. */
  registeredAt: string | null;
  /** Artwork lifecycle status, e.g. "verified" | "pending_blockchain". */
  status: string | null;
  /** Human-readable license, e.g. "All Rights Reserved". */
  licenseName: string | null;
  /** URL of the artwork's newest public, non-archived community post, if published. */
  communityUrl: string | null;
};

async function resolveDbArtworkById(artworkId: string): Promise<ResolvedDbArtwork | null> {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("registered_arts")
      .select(
        `
        id, title, c_secure_url, status, license_name, created_at,
        owner:users!registered_arts_owner_id_fkey ( username, first_name, last_name )
        `,
      )
      .eq("id", artworkId)
      .maybeSingle();

    if (error || !data) return null;

    // Prefer the owner's full name; fall back to username. The embedded join
    // may return an array or object depending on PostgREST output shaping.
    const owner = Array.isArray(data.owner) ? data.owner[0] : data.owner;
    const fullName = [owner?.first_name, owner?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const authorName = fullName || owner?.username || null;

    // Resolve the newest public community post for this artwork (if any).
    // A failed lookup must never break the enrichment, so swallow errors.
    let communityUrl: string | null = null;
    try {
      const { data: post } = await supabase
        .from("art_posts")
        .select("id")
        .eq("art_id", artworkId)
        .eq("visibility", "public")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (post?.id) {
        communityUrl = `/community/${post.id}`;
      }
    } catch {
      // No community post resolution — leave communityUrl as null.
    }

    return {
      imageUrl: data.c_secure_url ?? null,
      title: data.title,
      authorName,
      registeredAt: data.created_at ?? null,
      status: data.status ?? null,
      licenseName: data.license_name ?? null,
      communityUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Server action: enrich a web-check result with artwork metadata for
 * database matches (UUID → Supabase lookup: image URL, title, author,
 * registration date, status, license and public community post URL).
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

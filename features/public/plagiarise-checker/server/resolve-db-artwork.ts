import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** True when the value looks like a Supabase UUID (used to detect DB matches). */
export function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
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

/**
 * Resolves a registered-artwork database match (UUID) into its public metadata:
 * image URL, title, author, registration date, status, license, and community
 * post URL. Shared by the plagiarism analysis enrichment and the artwork
 * registration similarity report so both surfaces show the same artwork record.
 *
 * Returns `null` when the artwork cannot be found or the lookup fails — callers
 * should degrade gracefully rather than surface a broken card.
 */
export async function resolveDbArtworkById(
  artworkId: string,
): Promise<ResolvedDbArtwork | null> {
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
    // A failed lookup must never break the resolution, so swallow errors.
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

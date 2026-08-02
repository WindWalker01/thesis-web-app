/**
 * READ-ONLY evidence script for the "100% web match not entering Artwork
 * Verification queue" investigation.
 *
 * It performs only SELECT queries using the service-role key from .env:
 *  1. Lists the most recent art_similarity_scans (esp. best_similarity_percentage = 100).
 *  2. For each such scan: fetches the registered_arts row and counts artwork_reviews rows.
 *
 * No writes are performed.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// --- minimal .env parser (no dotenv dependency) ---
const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")]),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

console.log("=== Recent similarity scans (latest 10) ===");
const { data: recentScans, error: recentErr } = await supabase
  .from("art_similarity_scans")
  .select(
    "id, art_id, status, success, total_matches, best_source, best_link, best_url, best_similarity_percentage, completed_at, created_at",
  )
  .order("created_at", { ascending: false })
  .limit(10);

if (recentErr) {
  console.error("Failed to fetch scans:", recentErr);
  process.exit(1);
}
console.table(
  recentScans.map((s) => ({
    scan_id: s.id.slice(0, 8),
    art_id: s.art_id.slice(0, 8),
    status: s.status,
    success: s.success,
    matches: s.total_matches,
    best_source: s.best_source,
    best_sim: s.best_similarity_percentage,
    completed_at: s.completed_at,
  })),
);

console.log("\n=== Scans with best_similarity_percentage = 100 ===");
const { data: perfectScans, error: perfectErr } = await supabase
  .from("art_similarity_scans")
  .select(
    "id, art_id, owner_id, status, success, total_matches, best_source, best_link, best_url, best_similarity_percentage, completed_at, created_at",
  )
  .eq("best_similarity_percentage", 100)
  .order("created_at", { ascending: false })
  .limit(10);

if (perfectErr) {
  console.error("Failed to fetch 100% scans:", perfectErr);
  process.exit(1);
}

if (!perfectScans.length) {
  console.log("No scans with exactly 100 found. Trying >= 99.5 ...");
}

const scansToCheck =
  perfectScans.length > 0
    ? perfectScans
    : ((
        await supabase
          .from("art_similarity_scans")
          .select(
            "id, art_id, owner_id, status, success, total_matches, best_source, best_link, best_url, best_similarity_percentage, completed_at, created_at",
          )
          .gte("best_similarity_percentage", 99.5)
          .order("created_at", { ascending: false })
          .limit(10)
      ).data ?? []);

for (const scan of scansToCheck) {
  console.log("\n-----------------------------------------------");
  console.log("SCAN:", {
    id: scan.id,
    art_id: scan.art_id,
    status: scan.status,
    success: scan.success,
    total_matches: scan.total_matches,
    best_source: scan.best_source,
    best_similarity_percentage: scan.best_similarity_percentage,
    best_url: scan.best_url,
    best_link: scan.best_link,
    completed_at: scan.completed_at,
  });

  const { data: art, error: artErr } = await supabase
    .from("registered_arts")
    .select("id, owner_id, title, status, created_at")
    .eq("id", scan.art_id)
    .maybeSingle();

  if (artErr) console.log("  registered_arts error:", artErr.message);
  console.log("ARTWORK:", art ?? "(not found)");

  const {
    data: reviews,
    error: revErr,
    count,
  } = await supabase
    .from("artwork_reviews")
    .select(
      "id, artwork_id, status, reviewer_id, decision, assigned_at, created_at",
      {
        count: "exact",
      },
    )
    .eq("artwork_id", scan.art_id);

  if (revErr) console.log("  artwork_reviews error:", revErr.message);
  console.log(`REVIEWS for this artwork: ${count ?? reviews?.length ?? 0}`);
  if (reviews?.length) console.log(reviews);
}

console.log("\n=== Total artwork_reviews rows in system ===");
const { count: totalReviews } = await supabase
  .from("artwork_reviews")
  .select("*", { count: "exact", head: true });
console.log("artwork_reviews total:", totalReviews);

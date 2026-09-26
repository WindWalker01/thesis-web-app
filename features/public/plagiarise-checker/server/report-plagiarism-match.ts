"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireActiveAccount } from "@/lib/account-status";
import { isUuidLike } from "@/features/public/plagiarise-checker/server/resolve-db-artwork";

const reportPlagiarismMatchSchema = z.object({
  /** Matched registered artwork UUID (internal match). */
  matchedArtworkId: z.string().uuid("Invalid matched artwork ID"),
  matchedArtworkTitle: z.string().max(200).nullish(),
  /** Matched artwork image, so the report can show the artwork visually. */
  matchedArtworkImageUrl: z.string().max(2048).nullish(),
  /**
   * Cloudinary URL of the artwork the reporter uploaded/checked. Captured so
   * admins can see the reported copy next to the matched registered artwork.
   */
  originalImageUrl: z.string().url("Invalid original artwork URL").nullish(),
  /** Filename of the reporter's uploaded artwork. */
  originalTitle: z.string().max(200).nullish(),
  similarity: z.number().min(0).max(100),
  source: z.string().max(200).nullish(),
  matchedUrl: z.string().max(2048).nullish(),
  originalHash: z.string().max(200).nullish(),
  scanId: z.string().uuid("Invalid scan ID").nullish(),
  /**
   * Reporter's own statement: the original source link or an explanation of
   * why the matched artwork is theirs. Required, mirroring the community
   * copyright report rule.
   */
  proof: z
    .string()
    .trim()
    .min(1, "Please provide the original source / link or explain why you believe it’s stolen.")
    .max(2000, "Proof must be at most 2000 characters."),
  /** Optional extra context for the reviewers. */
  details: z
    .string()
    .trim()
    .max(1000, "Additional details must be at most 1000 characters.")
    .optional()
    .or(z.literal("")),
});

export type ReportPlagiarismMatchInput = z.infer<
  typeof reportPlagiarismMatchSchema
>;

export type ReportPlagiarismMatchResult =
  | { success: true; reportId: string; message: string }
  | {
      success: false;
      message: string;
      /** True when the user already submitted this match for review. */
      duplicate?: boolean;
      existingReportId?: string;
    };

/**
 * Server action: report an INTERNAL plagiarism match (a match against an
 * artwork already registered in ArtForgeLab) through the existing Reporting &
 * Complaint Management system.
 *
 * Creates a `reports` row with report_type = 'copyright', linked to the matched
 * registered artwork via target_type='artwork' + target_id, and snapshots the
 * similarity context into `metadata`. The existing `reports` INSERT triggers
 * (`notify_report_submitted_to_admins` / `..._to_reporter`) fire on insert, so
 * no bespoke notification path is introduced.
 */
export async function reportPlagiarismMatch(
  input: ReportPlagiarismMatchInput,
): Promise<ReportPlagiarismMatchResult> {
  const parsed = reportPlagiarismMatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid report submission.",
    };
  }

  let userId: string;
  try {
    userId = await requireActiveAccount();
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "You need to sign in to submit a report.",
    };
  }

  const data = parsed.data;
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  // Resolve a public community post for the matched artwork (if any) so the
  // existing admin report UI can keep resolving the reported artwork through
  // `reported_art_post_id`. When none exists, reported_art_post_id stays NULL
  // and the report is resolved through target_type + target_id instead.
  let reportedArtPostId: string | null = null;
  if (isUuidLike(data.matchedArtworkId)) {
    const { data: post } = await adminSupabase
      .from("art_posts")
      .select("id")
      .eq("art_id", data.matchedArtworkId)
      .eq("visibility", "public")
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    reportedArtPostId = post?.id ?? null;
  }

  // Duplicate prevention: same reporter + same matched artwork + same relevant
  // scan/match. `related_scan_id` may be NULL (public-page checks), in which
  // case the match identity collapses to (reporter, matched artwork).
  const { data: existingReports } = await supabase
    .from("reports")
    .select("id, related_scan_id")
    .eq("reporter_id", userId)
    .eq("report_type", "copyright")
    .eq("target_type", "artwork")
    .eq("target_id", data.matchedArtworkId);

  const existing = (existingReports ?? []).find(
    (r) => (r.related_scan_id ?? null) === (data.scanId ?? null),
  );
  if (existing) {
    return {
      success: false,
      duplicate: true,
      existingReportId: existing.id,
      message:
        "You have already submitted this match for review. View your report from My Reports.",
    };
  }

  const title = data.matchedArtworkTitle
    ? `Potential Copyright Concern — "${data.matchedArtworkTitle}"`
    : "Potential Copyright Concern — Registered Artwork Match";

  // The description holds the reporter's own words. Detection data (similarity,
  // hashes, matched URL) is structured data, not prose, so it is stored in
  // `metadata` and rendered by the admin plagiarism-report card instead of
  // being flattened into a text blob for reviewers to parse.
  const descriptionParts = [
    `Original source / proof: ${data.proof}`,
    data.details ? `Additional details: ${data.details}` : null,
  ].filter(Boolean);

  const description = [
    "Copyright report submitted from the plagiarism checker for an internal match against a registered artwork.",
    `Similarity: ${data.similarity.toFixed(1)}%`,
    ...descriptionParts,
  ].join("\n\n");

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: userId,
      reported_art_post_id: reportedArtPostId,
      report_type: "copyright",
      target_type: "artwork",
      target_id: data.matchedArtworkId,
      related_scan_id: data.scanId,
      title,
      description,
      metadata: {
        match_type: "internal",
        origin: "plagiarism_checker",
        source: data.source ?? "registered_arts",
        similarity_percentage: data.similarity,
        matched_art_id: data.matchedArtworkId,
        matched_artwork_title: data.matchedArtworkTitle ?? null,
        matched_artwork_image_url: data.matchedArtworkImageUrl ?? null,
        matched_url: data.matchedUrl ?? null,
        // The reporter's own uploaded copy. Same field name as
        // artwork_reviews.original_artwork_url so both admin surfaces agree.
        original_artwork_url: data.originalImageUrl ?? null,
        original_artwork_title: data.originalTitle ?? null,
        original_hash: data.originalHash ?? null,
        // Reporter's statement, kept structured so the admin UI can render the
        // human text separately from the detection evidence.
        reporter_proof: data.proof,
        reporter_details: data.details || null,
        detected_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (error || !report) {
    return {
      success: false,
      message: error?.message ?? "Failed to submit the report.",
    };
  }

  return {
    success: true,
    reportId: report.id,
    message: "Report submitted successfully.",
  };
}

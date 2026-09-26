"use server";

import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireActiveAccount } from "@/lib/account-status";

const requestPlagiarismManualReviewSchema = z.object({
  externalUrl: z.string().url("Invalid external match URL"),
  externalSource: z.string().max(200).nullish(),
  similarity: z.number().min(0).max(100),
  originalHash: z.string().max(200).nullish(),
  originalTitle: z.string().max(200).nullish(),
  originalImageUrl: z.string().url().nullish(),
  scanId: z.string().uuid("Invalid scan ID").nullish(),
  /** Present when the request originates from the registration flow. */
  artworkId: z.string().uuid("Invalid artwork ID").nullish(),
});

export type RequestPlagiarismManualReviewInput = z.infer<
  typeof requestPlagiarismManualReviewSchema
>;

export type RequestPlagiarismManualReviewResult =
  | { success: true; reviewId: string; message: string }
  | {
      success: false;
      message: string;
      duplicate?: boolean;
      existingReviewId?: string;
    };

/**
 * Server action: submit an EXTERNAL plagiarism match for investigation through
 * the existing manual artwork verification system (`artwork_reviews`).
 *
 * An external match has no registered_arts row that ArtForgeLab owns, so this
 * action does NOT create a copyright report against the external source.
 * Instead it creates (or enriches) an `artwork_reviews` record that a reviewer
 * can act on with the existing verification workflow.
 *
 * When `artworkId` is provided (registration flow), the uploaded artwork's
 * review already exists — this action enriches it with the external-match
 * evidence rather than creating a duplicate. For public-page requests there is
 * no artwork, so a new review row is created with `review_source = 'external'`.
 */
export async function requestPlagiarismManualReview(
  input: RequestPlagiarismManualReviewInput,
): Promise<RequestPlagiarismManualReviewResult> {
  const parsed = requestPlagiarismManualReviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review request.",
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
          : "You need to sign in to request a manual review.",
    };
  }

  const data = parsed.data;
  const adminSupabase = createSupabaseAdminClient();

  const matchMetadata = {
    match_type: "external",
    source: data.externalSource ?? "External API",
    external_url: data.externalUrl,
    similarity_percentage: data.similarity,
    original_hash: data.originalHash ?? null,
    submitted_at: new Date().toISOString(),
  };

  // ── Registration-flow external match: reuse the existing review ──────────
  if (data.artworkId) {
    const { data: existingReview, error: existingError } = await adminSupabase
      .from("artwork_reviews")
      .select("id, review_source, external_url")
      .eq("artwork_id", data.artworkId)
      .maybeSingle();

    if (existingError) {
      return { success: false, message: existingError.message };
    }

    if (existingReview) {
      // Enrich the existing review with external-match evidence if absent.
      if (existingReview.review_source !== "external" && !existingReview.external_url) {
        await adminSupabase
          .from("artwork_reviews")
          .update({
            review_source: "external",
            requested_by: userId,
            external_url: data.externalUrl,
            external_source: data.externalSource ?? null,
            similarity_percentage: data.similarity,
            related_scan_id: data.scanId ?? null,
            match_metadata: matchMetadata,
            original_artwork_url: data.originalImageUrl ?? null,
            original_artwork_title: data.originalTitle ?? null,
            original_hash: data.originalHash ?? null,
          })
          .eq("id", existingReview.id);
      }

      return {
        success: true,
        reviewId: existingReview.id,
        message: "This artwork is already under manual review.",
      };
    }

    // No review yet — create one for this artwork.
    const { data: created, error: createError } = await adminSupabase
      .from("artwork_reviews")
      .insert({
        artwork_id: data.artworkId,
        review_source: "external",
        requested_by: userId,
        status: "pending",
        reviewer_id: null,
        assigned_at: null,
        external_url: data.externalUrl,
        external_source: data.externalSource ?? null,
        similarity_percentage: data.similarity,
        related_scan_id: data.scanId ?? null,
        match_metadata: matchMetadata,
        original_artwork_url: data.originalImageUrl ?? null,
        original_artwork_title: data.originalTitle ?? null,
        original_hash: data.originalHash ?? null,
      })
      .select("id")
      .single();

    if (createError || !created) {
      return {
        success: false,
        message: createError?.message ?? "Failed to request manual review.",
      };
    }

    return {
      success: true,
      reviewId: created.id,
      message: "Manual review requested successfully.",
    };
  }

  // ── Public-page external match: no artwork, create a new review ──────────
  const { data: existingRequests } = await adminSupabase
    .from("artwork_reviews")
    .select("id, related_scan_id")
    .eq("review_source", "external")
    .eq("requested_by", userId)
    .eq("external_url", data.externalUrl);

  const existing = (existingRequests ?? []).find(
    (r) => (r.related_scan_id ?? null) === (data.scanId ?? null),
  );
  if (existing) {
    return {
      success: false,
      duplicate: true,
      existingReviewId: existing.id,
      message:
        "You have already submitted this match for review. The result is already in the manual review queue.",
    };
  }

  const { data: created, error: createError } = await adminSupabase
    .from("artwork_reviews")
    .insert({
      artwork_id: null,
      review_source: "external",
      requested_by: userId,
      status: "pending",
      reviewer_id: null,
      assigned_at: null,
      external_url: data.externalUrl,
      external_source: data.externalSource ?? null,
      similarity_percentage: data.similarity,
      related_scan_id: data.scanId ?? null,
      match_metadata: matchMetadata,
      original_artwork_url: data.originalImageUrl ?? null,
      original_artwork_title: data.originalTitle ?? null,
      original_hash: data.originalHash ?? null,
    })
    .select("id")
    .single();

  if (createError || !created) {
    return {
      success: false,
      message: createError?.message ?? "Failed to request manual review.",
    };
  }

  return {
    success: true,
    reviewId: created.id,
    message: "Manual review requested successfully.",
  };
}

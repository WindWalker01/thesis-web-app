/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReviewStatus, ReviewActionType } from "@/features/admin/artwork-verification/types";

export type ArtworkReviewData = {
  reviewId: string;
  artworkId: string;
  status: ReviewStatus;
  decision_reason: string | null;
  review_notes: string | null;
  requested_documents: string[];
  resubmission_count: number;
  actions: Array<{
    id: string;
    action: ReviewActionType | string;
    admin: { first_name: string; last_name: string } | null;
    notes: string | null;
    created_at: string;
  }>;
  evidence: Array<{
    id: string;
    review_id: string;
    user_id: string;
    message: string | null;
    files: Array<{ url: string; name: string; type: string; size: number }>;
    created_at: string;
  }>;
};

export async function getArtworkReviewData(
  artworkId: string
): Promise<{ success: boolean; data?: ArtworkReviewData; message?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Authentication required" };
    }

    const adminSupabase = createSupabaseAdminClient();

    // Fetch the review for this artwork
    const { data: review, error: reviewError } = await adminSupabase
      .from("artwork_reviews")
      .select("*")
      .eq("artwork_id", artworkId)
      .maybeSingle();

    if (reviewError) {
      return { success: false, message: reviewError.message };
    }

    if (!review) {
      return { success: false, message: "No review found for this artwork" };
    }

    // Fetch actions
    const { data: actions } = await adminSupabase
      .from("artwork_review_actions")
      .select(`
        id,
        action,
        notes,
        created_at,
        admin:users!artwork_review_actions_admin_id_fkey (
          id, first_name, last_name
        )
      `)
      .eq("review_id", review.id)
      .order("created_at", { ascending: true });

    // Fetch evidence
    const { data: evidence } = await adminSupabase
      .from("artwork_review_evidence")
      .select("*")
      .eq("review_id", review.id)
      .order("created_at", { ascending: false });

    return {
      success: true,
      data: {
        reviewId: review.id,
        artworkId: review.artwork_id,
        status: review.status,
        decision_reason: review.decision_reason,
        review_notes: review.review_notes,
        requested_documents: review.requested_documents ?? [],
        resubmission_count: review.resubmission_count ?? 0,
        actions: (actions ?? []).map((a: any) => ({
          id: a.id,
          action: a.action,
          admin: a.admin ? { first_name: a.admin.first_name, last_name: a.admin.last_name } : null,
          notes: a.notes,
          created_at: a.created_at,
        })),
        evidence: (evidence ?? []).map((e: any) => ({
          id: e.id,
          review_id: e.review_id,
          user_id: e.user_id,
          message: e.message,
          files: e.files ?? [],
          created_at: e.created_at,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch review data",
    };
  }
}
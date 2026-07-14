/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export type ReviewEvidenceFile = {
  url: string;
  name: string;
  type: string;
  size: number;
};

export type SubmitEvidenceResult = {
  success: boolean;
  message: string;
};

export type ReviewEvidenceData = {
  id: string;
  review_id: string;
  user_id: string;
  message: string | null;
  files: ReviewEvidenceFile[];
  created_at: string;
};

export async function submitReviewEvidence(
  reviewId: string,
  message: string,
  formData: FormData
): Promise<SubmitEvidenceResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Authentication required" };
    }

    // Fetch the review to verify ownership
    const adminSupabase = createSupabaseAdminClient();
    const { data: review } = await adminSupabase
      .from("artwork_reviews")
      .select("*, artwork:registered_arts!artwork_reviews_artwork_id_fkey(*)")
      .eq("id", reviewId)
      .single();

    if (!review) {
      return { success: false, message: "Review not found" };
    }

    const artwork = (review as any).artwork;
    if (!artwork) {
      return { success: false, message: "Artwork not found" };
    }

    // Verify the current user owns the artwork
    if (artwork.owner_id !== user.id) {
      return { success: false, message: "You do not own this artwork" };
    }

    // Verify the review is in needs_info status
    if (review.status !== "needs_info") {
      return { success: false, message: "Additional information is not currently requested for this artwork" };
    }

    // Upload files to Cloudinary
    const files: ReviewEvidenceFile[] = [];
    const fileEntries = Array.from(formData.entries()).filter(
      ([key, value]) => key.startsWith("file_") && value instanceof File
    );

    for (const [, file] of fileEntries) {
      const f = file as File;
      if (f.size === 0) continue;

      const buffer = Buffer.from(await f.arrayBuffer());
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "review-evidence",
            resource_type: "auto",
            use_filename: true,
            unique_filename: true,
            filename_override: f.name,
          },
          (error, result) => {
            if (error) reject(error);
            else if (!result) reject(new Error("Upload failed"));
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      files.push({
        url: result.secure_url,
        name: f.name,
        type: f.type,
        size: f.size,
      });
    }

    // Get admin users for notification
    const { data: admins } = await adminSupabase
      .from("users")
      .select("id")
      .eq("role", "admin");

    // Insert evidence record
    const { error: evidenceError } = await adminSupabase
      .from("artwork_review_evidence")
      .insert({
        review_id: reviewId,
        user_id: user.id,
        message: message || null,
        files: files,
      });

    if (evidenceError) {
      return { success: false, message: `Failed to save evidence: ${evidenceError.message}` };
    }

    // Update review status back to pending and increment resubmission count
    await adminSupabase
      .from("artwork_reviews")
      .update({
        status: "pending",
        reviewer_id: null,
        assigned_at: null,
        resubmission_count: (review.resubmission_count ?? 0) + 1,
        review_notes: null,
        requested_documents: [],
      })
      .eq("id", reviewId);

    // Record action in artwork_review_actions
    await adminSupabase.from("artwork_review_actions").insert({
      review_id: reviewId,
      admin_id: user.id,
      action: "evidence_submitted",
      previous_status: "needs_info",
      new_status: "pending",
      notes: message || "Additional evidence submitted",
    });

    // Notify all admins
    if (admins && admins.length > 0) {
      const adminNotifications = admins.map((admin: { id: string }) => ({
        user_id: admin.id,
        type: "artwork_verification_resubmitted" as const,
        title: "New Verification Evidence Submitted",
        message: `The artist has submitted additional information for manual verification of "${artwork.title}".`,
        related_art_id: review.artwork_id,
        action_url: `/admin/artwork-verification/${reviewId}`,
        metadata: {
          review_id: reviewId,
          artwork_id: review.artwork_id,
          artist_id: user.id,
          resubmission_count: (review.resubmission_count ?? 0) + 1,
        },
      }));

      await adminSupabase.from("notifications").insert(adminNotifications);
    }

    return { success: true, message: "Evidence submitted successfully. Your artwork has been returned to the review queue." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit evidence",
    };
  }
}

export async function getArtworkReviewEvidence(
  reviewId: string
): Promise<{ success: boolean; data?: ReviewEvidenceData[]; message?: string }> {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("artwork_review_evidence")
      .select("*")
      .eq("review_id", reviewId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data: data as ReviewEvidenceData[] };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch evidence",
    };
  }
}
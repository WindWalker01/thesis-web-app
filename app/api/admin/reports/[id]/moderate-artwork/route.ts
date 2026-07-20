import { NextRequest, NextResponse } from "next/server";
import {
  approveArtworkFromReview,
  rejectArtworkFromReview,
  removeArtworkFromReports,
  requestArtworkInformation,
  ensureReviewForArtwork,
  resolveReportAfterModeration,
  getReviewForArtwork,
} from "@/features/admin/shared/moderation-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";
import { logModerationAction, resolveReport } from "@/features/reports/server/reports-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reportId = (await params).id;
    const body = await request.json();
    const { action, reason, notes, artworkId, resolveOnComplete, userReason, artworkReason } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: { message: "Action is required" } },
        { status: 400 }
      );
    }

    // Get the current admin user using cookie-based auth (server client)
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }
    const adminId = user.id;

    // Use admin client for service-role DB operations (bypasses RLS)
    const supabase = createSupabaseAdminClient();
    const serverSupabase = await createSupabaseServerClient();

    let result;

    switch (action) {
      case "keep_artwork":
      case "approve_artwork": {
        // Keep artwork — no DB changes needed, just a no-op acknowledgment.
        // If resolveOnComplete is set, resolve the report.
        if (resolveOnComplete) {
          result = await resolveReportAfterModeration(
            reportId,
            adminId,
            "no_violation",
            reason ?? "Report dismissed — no infringement found after investigation."
          );
        } else {
          result = { success: true, message: "Artwork kept." };
        }
        break;
      }

      case "resolve_report": {
        // === ORCHESTRATED RESOLUTION ===
        // Single endpoint that handles decision, artwork actions, user actions, and resolution.
        const {
          decision: resolveDecision,
          summary: resolveSummary,
          artworkActions: resolveArtworkActions = [],
          userActions: resolveUserActions = [],
          artworkReason: resolveArtworkReason,
          userReason: resolveUserReason,
        } = body;

        if (!resolveDecision || !resolveSummary) {
          return NextResponse.json(
            { success: false, error: { message: "decision and summary are required" } },
            { status: 400 }
          );
        }

        // Idempotency check
        const report = await serverSupabase.from("reports").select("status").eq("id", reportId).single();
        if (report?.data?.status === "resolved") {
          return NextResponse.json({ success: true, alreadyResolved: true });
        }

        // Step 1: Execute artwork actions
        const validArtworkActions = ["remove_artwork", "restore_artwork", "mark_nsfw", "rerun_plagiarism"] as const;
        for (const awAction of resolveArtworkActions) {
          if (!validArtworkActions.includes(awAction)) continue;
          if (!artworkId) continue;

          try {
            if (awAction === "remove_artwork") {
              await removeArtworkFromReports(artworkId, resolveArtworkReason ?? `Via resolution — ${resolveDecision}`);
              await logModerationAction(serverSupabase, { reportId, adminId, action: "artwork_removed", notes: resolveArtworkReason ?? "Artwork removed." });
            } else if (awAction === "restore_artwork") {
              const { data: posts } = await supabase.from("art_posts").select("id").eq("art_id", artworkId);
              if (posts?.length) {
                await supabase.from("art_posts").update({ visibility: "public", is_archived: false }).in("id", posts.map((p: { id: string }) => p.id));
              }
              await logModerationAction(serverSupabase, { reportId, adminId, action: "artwork_restored", notes: resolveArtworkReason ?? "Artwork restored." });
            } else if (awAction === "mark_nsfw") {
              await supabase.from("art_posts").update({ is_nsfw: true }).eq("art_id", artworkId);
              await logModerationAction(serverSupabase, { reportId, adminId, action: "artwork_nsfw", notes: resolveArtworkReason ?? "Marked NSFW." });
            } else if (awAction === "rerun_plagiarism") {
              await supabase.from("art_similarity_scans").insert({ art_id: artworkId, owner_id: (await supabase.from("registered_arts").select("owner_id").eq("id", artworkId).single()).data?.owner_id, status: "pending", success: false, total_matches: 0 });
              await logModerationAction(serverSupabase, { reportId, adminId, action: "plagiarism_scan_rerun", notes: resolveArtworkReason ?? "Scan re-run." });
            }
          } catch (err) {
            console.error(`Artwork action ${awAction} failed:`, err);
          }
        }

        // Step 2: Execute user actions
        for (const usrAction of resolveUserActions) {
          if (!["warn_user", "suspend_user", "ban_user"].includes(usrAction)) continue;

          // Resolve target user from artwork owner
          let targetUserId: string | null = null;
          if (artworkId) {
            const { data: art } = await supabase.from("registered_arts").select("owner_id").eq("id", artworkId).single();
            targetUserId = art?.owner_id ?? null;
          }
          if (!targetUserId) continue;

          try {
            if (usrAction === "warn_user") {
              const { warnUser } = await import("@/features/admin/user-management/server/admin-actions");
              await warnUser({ user_id: targetUserId, reason: resolveUserReason ?? `Via resolution — ${resolveDecision}`, report_id: reportId });
              await serverSupabase.from("report_actions").insert({ report_id: reportId, admin_id: adminId, action: "user_warned", previous_status: "under_review", new_status: "under_review", notes: resolveUserReason ?? "Warning issued." });
            } else if (usrAction === "suspend_user") {
              const { suspendUser } = await import("@/features/admin/user-management/server/admin-actions");
              await suspendUser({ user_id: targetUserId, duration: "temporary", duration_days: 7, reason: resolveUserReason ?? `Via resolution — ${resolveDecision}` });
              await serverSupabase.from("report_actions").insert({ report_id: reportId, admin_id: adminId, action: "user_suspended", previous_status: "under_review", new_status: "under_review", notes: resolveUserReason ?? "Account suspended." });
            } else if (usrAction === "ban_user") {
              const { banUser } = await import("@/features/admin/user-management/server/admin-actions");
              await banUser({ user_id: targetUserId, reason: resolveUserReason ?? `Via resolution — ${resolveDecision}` });
              await serverSupabase.from("report_actions").insert({ report_id: reportId, admin_id: adminId, action: "user_banned", previous_status: "under_review", new_status: "under_review", notes: resolveUserReason ?? "Account banned." });
            }
          } catch (err) {
            console.error(`User action ${usrAction} failed:`, err);
          }
        }

        // Step 3: Resolve the report
        const resolution = await resolveReport(serverSupabase, {
          reportId,
          adminId,
          decision: resolveDecision as "no_violation" | "guideline_violation" | "copyright_confirmed" | "insufficient_evidence" | "false_report",
          summary: resolveSummary,
        });

        result = { success: true, message: "Report resolved." };
        break;
      }

      case "reject_artwork": {
        // Check if artwork is already blockchain-registered
        const { data: artworkForReject } = await supabase
          .from("registered_arts")
          .select("tx_hash, status")
          .eq("id", artworkId)
          .single();

        if (artworkForReject?.tx_hash && artworkForReject?.status === "active") {
          // Artwork already registered — skip review, resolve report directly
          result = await resolveReportAfterModeration(
            reportId,
            adminId,
            "infringement_confirmed",
            reason ?? "Report upheld — infringement confirmed after investigation."
          );
        } else {
          // Normal flow: ensure review exists, then reject artwork
          const reviewResult = await ensureReviewForArtwork(artworkId);
          if (!reviewResult.success || !reviewResult.reviewId) {
            return NextResponse.json(
              { success: false, error: { message: reviewResult.message } },
              { status: 500 }
            );
          }

          const rejectResult = await rejectArtworkFromReview(
            artworkId,
            reviewResult.reviewId,
            reason ?? "Rejected via report moderation",
            notes ?? ""
          );

          if (rejectResult.success) {
            result = await resolveReportAfterModeration(
              reportId,
              adminId,
              "infringement_confirmed",
              reason ?? "Artwork was flagged during report investigation."
            );
          } else {
            result = rejectResult;
          }
        }
        break;
      }

      case "remove_artwork": {
        result = await removeArtworkFromReports(
          artworkId,
          reason ?? "Removed via report moderation"
        );

        // Log to report timeline
        await logModerationAction(serverSupabase, {
          reportId,
          adminId,
          action: "artwork_removed",
          notes: reason ?? "Artwork removed by administrator.",
        });

        if (result.success && resolveOnComplete !== false) {
          result = await resolveReportAfterModeration(
            reportId,
            adminId,
            "infringement_confirmed",
            reason ?? "Artwork was removed during report investigation."
          );
        }
        break;
      }

      case "restore_artwork": {
        // Un-archive the artwork post and set visibility back to public
        const { data: artPosts } = await supabase
          .from("art_posts")
          .select("id")
          .eq("art_id", artworkId);

        if (artPosts && artPosts.length > 0) {
          const postIds = artPosts.map((p) => p.id);
          const { error: updateError } = await supabase
            .from("art_posts")
            .update({
              visibility: "public",
              is_archived: false,
            })
            .in("id", postIds);

          if (updateError) {
            return NextResponse.json(
              { success: false, error: { message: `Failed to restore artwork: ${updateError.message}` } },
              { status: 500 }
            );
          }
        }

        // Log to report timeline
        await logModerationAction(serverSupabase, {
          reportId,
          adminId,
          action: "artwork_restored",
          notes: reason ?? "Artwork restored by administrator.",
        });

        // Log to admin audit log
        await supabase.from("admin_audit_logs").insert({
          admin_id: adminId,
          action: "reactivate_user", // using existing action — could also be a custom one
          target_user_id: null,
          reason: reason ?? "Artwork restored",
          metadata: { artwork_id: artworkId, report_id: reportId, action_type: "restore_artwork" },
        });

        result = { success: true, message: "Artwork has been restored." };
        break;
      }

      case "mark_nsfw": {
        const { error: nsfwError } = await supabase
          .from("art_posts")
          .update({ is_nsfw: true })
          .eq("art_id", artworkId);

        if (nsfwError) {
          return NextResponse.json(
            { success: false, error: { message: `Failed to mark as NSFW: ${nsfwError.message}` } },
            { status: 500 }
          );
        }

        // Log to report timeline
        await logModerationAction(serverSupabase, {
          reportId,
          adminId,
          action: "artwork_nsfw",
          notes: reason ?? "Artwork marked as NSFW by administrator.",
        });

        // Log to admin audit log
        await supabase.from("admin_audit_logs").insert({
          admin_id: adminId,
          action: "send_notification",
          target_user_id: null,
          reason: reason ?? "Artwork marked as NSFW",
          metadata: { artwork_id: artworkId, report_id: reportId, action_type: "mark_nsfw" },
        });

        result = { success: true, message: "Artwork has been marked as NSFW." };
        break;
      }

      case "rerun_plagiarism": {
        // Check if a scan is already pending/running
        const { data: existingScan } = await supabase
          .from("art_similarity_scans")
          .select("status")
          .eq("art_id", artworkId)
          .in("status", ["pending", "running"])
          .maybeSingle();

        if (existingScan) {
          return NextResponse.json(
            { success: false, error: { message: "A plagiarism scan is already in progress for this artwork." } },
            { status: 400 }
          );
        }

        // Get artwork owner
        const { data: artwork } = await supabase
          .from("registered_arts")
          .select("owner_id, title")
          .eq("id", artworkId)
          .single();

        if (!artwork) {
          return NextResponse.json(
            { success: false, error: { message: "Artwork not found." } },
            { status: 404 }
          );
        }

        // Insert a new scan
        const { error: scanError } = await supabase
          .from("art_similarity_scans")
          .insert({
            art_id: artworkId,
            owner_id: artwork.owner_id,
            status: "pending",
            success: false,
            total_matches: 0,
          });

        if (scanError) {
          return NextResponse.json(
            { success: false, error: { message: `Failed to create scan: ${scanError.message}` } },
            { status: 500 }
          );
        }

        // Log to report timeline
        await logModerationAction(serverSupabase, {
          reportId,
          adminId,
          action: "plagiarism_scan_rerun",
          notes: reason ?? "Plagiarism scan re-run triggered by administrator.",
        });

        result = { success: true, message: "Plagiarism scan has been queued." };
        break;
      }

      case "request_more_info": {
        // Get the existing review for this artwork
        const existingReviewId = await getReviewForArtwork(artworkId);
        if (!existingReviewId) {
          return NextResponse.json(
            { success: false, error: { message: "No review found for this artwork. Please start a review first." } },
            { status: 400 }
          );
        }

        result = await requestArtworkInformation(
          artworkId,
          existingReviewId,
          body.documents ?? [],
          notes ?? ""
        );

        if (result.success) {
          // The artwork review is already set to "needs_info" by requestArtworkInformation().
          // Keep the report at "under_review" and record the information request in the audit log.
          await supabase.from("report_actions").insert({
            report_id: reportId,
            admin_id: adminId,
            action: "evidence_requested",
            previous_status: "under_review",
            new_status: "under_review",
            notes: `Information requested from artist for artwork moderation. ${notes ?? ""}`,
          });
        }
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: { message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }

    // Normalize response: convert { success: false, message } to { success: false, error: { message } }
    // because the frontend (ReportDrawer) expects result.error?.message
    if (result && !result.success && "message" in result) {
      return NextResponse.json(
        { success: false, error: { message: result.message } },
        { status: 500 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to moderate artwork" },
      },
      { status: 500 }
    );
  }
}
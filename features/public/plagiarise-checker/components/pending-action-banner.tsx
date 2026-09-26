"use client";

import { useState } from "react";
import { AlertTriangle, X, Flag, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/features/user/auth/hooks/useAuth";
import {
  clearPendingMatchAction,
  loadPendingMatchAction,
  type PendingMatchAction,
} from "../lib/match-action-storage";
import { ReportCopyrightModal } from "./report-copyright-modal";
import { reportPlagiarismMatch } from "../server/report-plagiarism-match";
import { requestPlagiarismManualReview } from "../server/request-plagiarism-manual-review";
import { uploadFileToCloudinary } from "@/lib/cloudinary/direct-upload";
import { dataUrlToFile } from "../lib/image-preview";

/**
 * Restores the pending report/manual-review action after the user signed in
 * from a plagiarism match. The match context and the reporter's text survive the
 * auth round-trip in sessionStorage; the original File does not, so a small
 * preview is captured beforehand and re-uploaded as evidence on submission.
 * External reviews prompt the user to re-select the artwork they checked.
 */
export function PendingActionBanner() {
  const { isAuthenticated } = useAuth();
  const [pending, setPending] = useState<PendingMatchAction | null>(() => {
    if (typeof window === "undefined") return null;
    return loadPendingMatchAction();
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  /** True while the restored preview is being uploaded as report evidence. */
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  if (!isAuthenticated || !pending) return null;

  function dismiss() {
    clearPendingMatchAction();
    setPending(null);
    setReportOpen(false);
  }

  /** Confirms the (prefilled) copyright report restored after sign-in. */
  async function handleReportSubmit(values: { proof: string; details: string }) {
    const action = pending!;
    if (!action.context.matchedArtworkId) {
      setReportError("The matched artwork could not be identified.");
      return;
    }

    setIsSubmitting(true);
    setReportError(null);
    try {
      // The reporter's File did not survive the auth round trip, but the
      // downscaled preview captured before signing in did. Rehydrate it into a
      // File and upload it so the admin gets real evidence rather than an
      // empty comparison. Failure here must not block the report.
      let uploadedUrl: string | null = null;
      const restoredFile = action.originalPreviewDataUrl
        ? dataUrlToFile(
            action.originalPreviewDataUrl,
            action.filename ?? "reported-artwork.jpg",
          )
        : null;
      if (restoredFile) {
        try {
          setUploadingEvidence(true);
          const uploaded = await uploadFileToCloudinary(
            restoredFile,
            "plagiarism-review",
          );
          uploadedUrl = uploaded.secureUrl;
        } catch {
          toast.error(
            "The artwork could not be attached. The report will be submitted without it.",
          );
        } finally {
          setUploadingEvidence(false);
        }
      }

      const result = await reportPlagiarismMatch({
        matchedArtworkId: action.context.matchedArtworkId,
        matchedArtworkTitle: action.context.matchedArtworkTitle,
        matchedArtworkImageUrl: action.context.matchedArtworkImageUrl,
        similarity: action.context.similarity ?? 0,
        source: "registered_arts",
        matchedUrl: action.context.matchedArtworkUrl,
        originalHash: action.context.originalHash,
        originalImageUrl: uploadedUrl,
        originalTitle: action.filename ?? null,
        scanId: action.context.scanId,
        proof: values.proof,
        details: values.details,
      });
      if (result.success) {
        toast.success("Report submitted. View it from My Reports.");
        dismiss();
      } else {
        setReportError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setReportError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  /** External matches keep the one-click manual review flow. */
  async function runAction() {
    const action = pending!;
    if (!action.context.externalUrl) {
      toast.error("The external match URL could not be identified.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPlagiarismManualReview({
        externalUrl: action.context.externalUrl,
        externalSource: action.context.externalSource,
        similarity: action.context.similarity ?? 0,
        originalHash: action.context.originalHash,
        originalTitle: action.filename ?? null,
        originalImageUrl: null,
        scanId: action.context.scanId,
        artworkId: null,
      });
      if (result.success) {
        toast.success("Manual review requested. A reviewer will investigate.");
        dismiss();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isInternal = pending.action === "report";
  const similarity =
    pending.context.similarity !== null
      ? `${pending.context.similarity.toFixed(1)}%`
      : "N/A";

  /**
   * Copyright reports open the report modal (prefilled with whatever the user
   * already typed before signing in) so they can review and confirm their
   * statement. Manual reviews have no form and submit immediately.
   */
  function handleAction() {
    if (isInternal) {
      setReportError(null);
      setReportOpen(true);
      return;
    }
    void runAction();
  }

  return (
    <div className="bg-primary/5 border border-primary/30 rounded-2xl px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          <AlertTriangle size={15} className="text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Continue your {isInternal ? "report" : "manual review"} request
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              You were about to{" "}
              {isInternal ? "report a registered artwork match" : "request a manual review for an external match"}
              {similarity !== "N/A" && <> ({similarity} similarity)</>}.{" "}
              {isInternal
                ? "Your details were saved — confirm to submit the copyright report."
                : "Re-select the artwork you checked to attach it to the review."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={isInternal ? "default" : "outline"}
            className="gap-1.5"
            onClick={handleAction}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : isInternal ? (
              <Flag size={13} />
            ) : (
              <ShieldAlert size={13} />
            )}
            {isInternal ? "Continue report" : "Request review"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Dismiss"
            onClick={dismiss}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {pending && (
        <ReportCopyrightModal
          open={reportOpen}
          onOpenChange={setReportOpen}
          context={pending.context}
          initialProof={pending.proof}
          initialDetails={pending.details}
          originalPreviewUrl={pending.originalPreviewDataUrl ?? null}
          isSubmitting={isSubmitting}
          uploadingEvidence={uploadingEvidence}
          error={reportError}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
}

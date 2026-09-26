"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/features/user/auth/hooks/useAuth";
import { uploadFileToCloudinary } from "@/lib/cloudinary/direct-upload";
import type { PlagiarismMatchContext } from "../lib/match-source";
import { fileToPreviewDataUrl } from "../lib/image-preview";
import {
  savePendingMatchAction,
  type PendingMatchAction,
} from "../lib/match-action-storage";
import { reportPlagiarismMatch } from "../server/report-plagiarism-match";
import { requestPlagiarismManualReview } from "../server/request-plagiarism-manual-review";
import { ReportCopyrightModal } from "./report-copyright-modal";

interface MatchActionButtonProps {
  /** Serializable match context (source, URL, similarity, scan, ...). */
  context: PlagiarismMatchContext;
  /** Original file being checked (external reviews upload it as evidence). */
  originalFile?: File | null;
  /** Filename of the artwork being checked. */
  filename?: string | null;
  size?: "sm" | "default";
  /** Called after a successful report/manual-review submission. */
  onSuccess?: () => void;
  /** Registered artwork id (registration flow): reuse its existing review. */
  artworkId?: string | null;
  /** Already-uploaded original image URL (registration flow). */
  originalImageUrl?: string | null;
  /**
   * Local preview of the reporter's uploaded artwork (blob/object URL), shown in
   * the copyright-report modal so the reporter can confirm what they are
   * reporting before submitting.
   */
  originalPreviewUrl?: string | null;
}

/**
 * The single "take action" button on a plagiarism match.
 *
 * - INTERNAL match  -> "Report Artwork" (existing Reporting system, copyright).
 * - EXTERNAL match  -> "Manual Review" (existing manual artwork verification).
 *
 * The page is public, so this component handles the unauthenticated case by
 * persisting the match/action context and redirecting to login, returning the
 * user to the plagiarism checker afterwards.
 */
export function MatchActionButton({
  context,
  originalFile,
  filename,
  size = "sm",
  onSuccess,
  artworkId,
  originalImageUrl,
  originalPreviewUrl,
}: MatchActionButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  /** True while the reporter's uploaded file is being attached to the report. */
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  /** Prefilled reporter text, used when a pending action is restored. */
  const [prefill, setPrefill] = useState<{ proof?: string; details?: string }>(
    {}
  );

  const isInternal = context.origin === "internal";

  /**
   * Resolves a Cloudinary URL for the artwork the reporter uploaded/checked.
   *
   * The report must show the reported copy next to the matched registered
   * artwork, otherwise an admin cannot tell the two apart. Returns `null`
   * (rather than throwing) when no file is in hand — e.g. after the login
   * round-trip, since File bytes do not survive sessionStorage — so the report
   * still submits without an image.
   */
  async function resolveOriginalImageUrl(
    file: File | null | undefined
  ): Promise<string | null> {
    if (file) {
      try {
        setUploadingEvidence(true);
        const uploaded = await uploadFileToCloudinary(
          file,
          "plagiarism-review"
        );
        return uploaded.secureUrl;
      } catch {
        toast.error(
          "The uploaded artwork could not be attached. The report will be submitted without it."
        );
        return null;
      } finally {
        setUploadingEvidence(false);
      }
    }
    return originalImageUrl ?? null;
  }

  /** External matches only — internal matches go through the report modal. */
  async function runAction(fileOverride?: File | null) {
    setPending(true);
    try {
      if (!context.externalUrl) {
        toast.error("The external match URL could not be identified.");
        return;
      }

      const file = fileOverride ?? originalFile ?? null;
      const originalImageUrlResolved = await resolveOriginalImageUrl(file);

      const result = await requestPlagiarismManualReview({
        externalUrl: context.externalUrl,
        externalSource: context.externalSource,
        similarity: context.similarity ?? 0,
        originalHash: context.originalHash,
        originalTitle: filename ?? null,
        originalImageUrl: originalImageUrlResolved,
        scanId: context.scanId,
        artworkId: artworkId ?? null,
      });
      if (result.success) {
        toast.success("Manual review requested. A reviewer will investigate.");
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  /** Submitted from the copyright-report modal. */
  async function submitReport(values: { proof: string; details: string }) {
    if (!context.matchedArtworkId) {
      setReportError("The matched artwork could not be identified.");
      return;
    }

    // The plagiarism checker page is public: persist the match *and* the text
    // the reporter typed, then sign in and restore the prefilled modal. The
    // File cannot survive the round trip, so capture a small preview now and
    // turn it back into an uploadable File when the report is confirmed.
    if (!isAuthenticated) {
      const originalPreviewDataUrl = originalFile
        ? await fileToPreviewDataUrl(originalFile)
        : null;
      savePendingMatchAction({
        action: "report",
        context,
        filename: filename ?? null,
        proof: values.proof,
        details: values.details,
        ...(originalPreviewDataUrl
          ? { originalPreviewDataUrl }
          : {}),
      });
      router.push("/login?next=/plagiarism-checker");
      return;
    }

    setPending(true);
    setReportError(null);
    try {
      // Attach the reporter's uploaded artwork so the admin can see the
      // reported copy next to the matched registered artwork.
      const reportedImageUrl = await resolveOriginalImageUrl(originalFile);

      const result = await reportPlagiarismMatch({
        matchedArtworkId: context.matchedArtworkId,
        matchedArtworkTitle: context.matchedArtworkTitle,
        matchedArtworkImageUrl: context.matchedArtworkImageUrl,
        similarity: context.similarity ?? 0,
        source: "registered_arts",
        matchedUrl: context.matchedArtworkUrl,
        originalHash: context.originalHash,
        originalImageUrl: reportedImageUrl,
        originalTitle: filename ?? null,
        scanId: context.scanId,
        proof: values.proof,
        details: values.details,
      });
      if (result.success) {
        setReportOpen(false);
        setPrefill({});
        toast.success("Report submitted. View it from My Reports.");
        onSuccess?.();
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
      setPending(false);
    }
  }

  /** Opens the copyright-report modal (internal matches only). */
  function openReportModal(prefillValues?: { proof?: string; details?: string }) {
    setReportError(null);
    setPrefill(prefillValues ?? {});
    setReportOpen(true);
  }

  function handleClick() {
    // Copyright reports are always filled in through the modal: the reporter
    // must state their original source before the report can be submitted.
    if (isInternal) {
      openReportModal();
      return;
    }
    if (!isAuthenticated) {
      const pendingAction: PendingMatchAction = {
        action: isInternal ? "report" : "review",
        context,
        filename: filename ?? null,
      };
      savePendingMatchAction(pendingAction);
      router.push("/login?next=/plagiarism-checker");
      return;
    }

    // External reviews need the original artwork for side-by-side comparison.
    // When it isn't available (e.g. after signing in) and there is no
    // registered artwork to fall back on, ask the user to reselect the file.
    if (!isInternal && !originalFile && !artworkId) {
      fileInputRef.current?.click();
      return;
    }

    void runAction();
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = "";
          if (file) void runAction(file);
        }}
      />
      <Button
        type="button"
        size={size}
        variant={isInternal ? "default" : "outline"}
        onClick={handleClick}
        disabled={pending}
        className="gap-1.5"
      >
        {pending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : isInternal ? (
          <Flag size={13} />
        ) : (
          <ShieldAlert size={13} />
        )}
        {isInternal ? "Report Artwork" : "Manual Review"}
      </Button>
      {isInternal && (
        <ReportCopyrightModal
          open={reportOpen}
          onOpenChange={(next) => {
            setReportOpen(next);
            if (!next) setReportError(null);
          }}
          context={context}
          initialProof={prefill.proof}
          initialDetails={prefill.details}
          originalPreviewUrl={originalPreviewUrl}
          isSubmitting={pending}
          uploadingEvidence={uploadingEvidence}
          error={reportError}
          onSubmit={(values) => void submitReport(values)}
        />
      )}
    </>
  );
}

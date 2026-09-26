"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import { uploadFileToCloudinary } from "@/lib/cloudinary/direct-upload";
import type { PlagiarismMatchContext } from "../lib/match-source";
import {
  savePendingMatchAction,
  type PendingMatchAction,
} from "../lib/match-action-storage";
import { reportPlagiarismMatch } from "../server/report-plagiarism-match";
import { requestPlagiarismManualReview } from "../server/request-plagiarism-manual-review";

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
}: MatchActionButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState(false);

  const isInternal = context.origin === "internal";

  async function runAction(fileOverride?: File | null) {
    setPending(true);
    try {
      if (isInternal) {
        if (!context.matchedArtworkId) {
          toast.error("The matched artwork could not be identified.");
          return;
        }
        const result = await reportPlagiarismMatch({
          matchedArtworkId: context.matchedArtworkId,
          matchedArtworkTitle: context.matchedArtworkTitle,
          similarity: context.similarity ?? 0,
          source: "registered_arts",
          matchedUrl: context.matchedArtworkUrl,
          originalHash: context.originalHash,
          scanId: context.scanId,
        });
        if (result.success) {
          toast.success("Report submitted. View it from My Reports.");
          onSuccess?.();
        } else {
          toast.error(result.message);
        }
        return;
      }

      // External match -> request manual review.
      if (!context.externalUrl) {
        toast.error("The external match URL could not be identified.");
        return;
      }

      const file = fileOverride ?? originalFile ?? null;
      let originalImageUrlResolved = originalImageUrl ?? null;
      if (file) {
        const uploaded = await uploadFileToCloudinary(file, "plagiarism-review");
        originalImageUrlResolved = uploaded.secureUrl;
      }

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

  function handleClick() {
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
    </>
  );
}

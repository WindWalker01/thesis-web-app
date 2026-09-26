"use client";

import { useState } from "react";
import Image from "next/image";
import { Flag, Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PlagiarismMatchContext } from "../lib/match-source";

export const COPYRIGHT_PROOF_MAX = 2000;
export const COPYRIGHT_DETAILS_MAX = 1000;

interface ReportCopyrightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: PlagiarismMatchContext;
  /** Prefilled values (restored from the pending action after signing in). */
  initialProof?: string;
  initialDetails?: string;
  isSubmitting?: boolean;
  /** True while the reporter's uploaded file is being attached to the report. */
  uploadingEvidence?: boolean;
  error?: string | null;
  /**
   * Local preview (blob/object URL) of the artwork the reporter uploaded, so
   * they can see exactly what they are reporting.
   */
  originalPreviewUrl?: string | null;
  onSubmit: (values: { proof: string; details: string }) => void;
}

/**
 * Copyright report form shown when a user reports an INTERNAL plagiarism match
 * (a match against an artwork already registered on ArtForgeLab).
 *
 * Mirrors the community "Report artwork" modal: a required proof/source field
 * plus optional additional details. The matched artwork is presented as a
 * visual card (thumbnail, title, author, link) rather than a bare URL, so the
 * reporter always knows exactly what they are reporting.
 */
export function ReportCopyrightModal({
  open,
  onOpenChange,
  context,
  initialProof = "",
  initialDetails = "",
  isSubmitting = false,
  uploadingEvidence = false,
  error = null,
  originalPreviewUrl = null,
  onSubmit,
}: ReportCopyrightModalProps) {
  const [proof, setProof] = useState(initialProof);
  const [details, setDetails] = useState(initialDetails);
  const [touched, setTouched] = useState(false);

  // Re-seed the fields whenever the modal is (re)opened so a restored pending
  // action is prefilled while a fresh report starts blank. Adjusting state
  // during render (instead of in an effect) avoids a cascading re-render.
  const [seed, setSeed] = useState({ open, initialProof, initialDetails });
  if (
    seed.open !== open ||
    seed.initialProof !== initialProof ||
    seed.initialDetails !== initialDetails
  ) {
    setSeed({ open, initialProof, initialDetails });
    setProof(initialProof);
    setDetails(initialDetails);
    setTouched(false);
  }

  const proofMissing = touched && !proof.trim();
  const viewUrl = context.matchedArtworkCommunityUrl ?? context.matchedArtworkUrl;
  const similarity =
    context.similarity !== null ? `${context.similarity.toFixed(1)}%` : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!proof.trim()) return;
    onSubmit({ proof: proof.trim(), details: details.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-2xl max-h-[85vh] flex flex-col bg-card">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Flag size={16} className="text-primary shrink-0" />
            Report copyright infringement
          </DialogTitle>
          <DialogDescription className="text-sm">
            This artwork is already registered on ArtForgeLab. Tell us why you
            believe it infringes your rights — an admin will review the report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="custom-scrollbar flex-1 min-h-0 space-y-4 overflow-y-auto pr-2">
            {/* Side-by-side: what the reporter uploaded vs. what was matched.
                Rendered visually, never as a raw URL. */}
            <div className="rounded-xl border overflow-hidden">
              <div className="grid grid-cols-2 divide-x">
                <div className="space-y-2 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Your upload
                  </p>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    {originalPreviewUrl ? (
                      <Image
                        src={originalPreviewUrl}
                        alt="Artwork you uploaded"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                        No preview available
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Matched artwork
                  </p>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    {context.matchedArtworkImageUrl ? (
                      <Image
                        src={context.matchedArtworkImageUrl}
                        alt={context.matchedArtworkTitle ?? "Matched registered artwork"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                        No preview available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1 border-t p-3">
                <p className="text-sm font-semibold leading-snug break-words text-foreground">
                  {context.matchedArtworkTitle ?? "Registered artwork"}
                </p>
                {context.matchedArtworkAuthor && (
                  <p className="text-xs text-muted-foreground">
                    by {context.matchedArtworkAuthor}
                  </p>
                )}
                {similarity && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {similarity}
                    </span>{" "}
                    visual similarity between the two
                  </p>
                )}
                {viewUrl && (
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-2 hover:opacity-75"
                  >
                    View registered artwork
                    <ExternalLink size={11} className="shrink-0" />
                  </a>
                )}
              </div>
            </div>

            {uploadingEvidence && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin" />
                Attaching your uploaded artwork to the report…
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="copyright-proof" className="text-sm">
                Original source / proof <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="copyright-proof"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="Paste the original link (e.g. Instagram/ArtStation), or explain why this artwork is yours..."
                className="min-h-24 rounded-xl"
                maxLength={COPYRIGHT_PROOF_MAX}
                aria-invalid={proofMissing}
                aria-describedby={
                  proofMissing ? "copyright-proof-error" : undefined
                }
              />
              <div className="flex items-center justify-between gap-2">
                {proofMissing ? (
                  <p id="copyright-proof-error" className="text-xs text-destructive">
                    Please provide the original source / link or explain why you
                    believe it’s stolen.
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {proof.length}/{COPYRIGHT_PROOF_MAX}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="copyright-details" className="text-sm">
                Additional details (optional)
              </Label>
              <Textarea
                id="copyright-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any extra context that can help reviewers..."
                className="min-h-20 rounded-xl"
                maxLength={COPYRIGHT_DETAILS_MAX}
              />
              <div className="text-right text-[10px] tabular-nums text-muted-foreground">
                {details.length}/{COPYRIGHT_DETAILS_MAX}
              </div>
            </div>

            {error && (
              <div role="alert" className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 gap-2 pt-3">
            <Button
              variant="outline"
              className="cursor-pointer rounded-xl"
              onClick={() => onOpenChange(false)}
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button className="cursor-pointer gap-1.5 rounded-xl" type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Fingerprint,
  ScanSearch,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, truncateHash } from "@/lib/client-utils";
import type { AdminReportDetail, MatchedArtworkRef } from "@/features/reports/types";

/** Metadata snapshot written when a copyright report comes from the checker. */
export type PlagiarismReportMetadata = {
  match_type?: string;
  origin?: string;
  source?: string;
  similarity_percentage?: number;
  matched_art_id?: string;
  matched_artwork_title?: string | null;
  matched_artwork_image_url?: string | null;
  matched_url?: string | null;
  /** The artwork the reporter uploaded (the reported copy). */
  original_artwork_url?: string | null;
  original_artwork_title?: string | null;
  original_hash?: string | null;
  reporter_proof?: string;
  reporter_details?: string | null;
  detected_at?: string | null;
};

/** True when the report was filed from the plagiarism checker's internal match. */
export function isPlagiarismReport(detail: AdminReportDetail): boolean {
  const meta = (detail.report.metadata ?? {}) as PlagiarismReportMetadata;
  return (
    meta.match_type === "internal" ||
    meta.origin === "plagiarism_checker" ||
    typeof meta.similarity_percentage === "number" ||
    Boolean(detail.report.related_scan_id)
  );
}

function similarityTone(similarity: number) {
  if (similarity >= 90) return "text-red-400";
  if (similarity >= 70) return "text-amber-400";
  return "text-emerald-400";
}

interface PlagiarismReportCardProps {
  detail: AdminReportDetail;
}

/**
 * Admin-facing view of a copyright report raised from a plagiarism detection.
 *
 * Renders the matched artwork as an image, the detection evidence as structured
 * fields, and the reporter's own statement separately — replacing the raw
 * description blob ("A potentially similar registered artwork was detected…")
 * that previously carried the same information as unstructured text.
 */
interface ArtworkTileProps {
  label: string;
  imageUrl: string | null;
  caption: string;
  /** Shown in place of the image when none is available. */
  emptyHint: string;
  href?: string | null;
}

/** One artwork thumbnail with a caption, degrading to a labelled placeholder. */
function ArtworkTile({
  label,
  imageUrl,
  caption,
  emptyHint,
  href,
}: ArtworkTileProps) {
  return (
    <div className="space-y-1.5 rounded-md border bg-background p-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="relative aspect-square w-full overflow-hidden rounded bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${label}: ${caption}`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
            <Fingerprint size={15} className="text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground">{emptyHint}</span>
          </div>
        )}
      </div>
      <p className="truncate text-[11px] text-muted-foreground" title={caption}>
        {caption}
      </p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-medium text-primary underline underline-offset-2 hover:opacity-75"
        >
          Open full size <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}

export function PlagiarismReportCard({ detail }: PlagiarismReportCardProps) {
  const meta = (detail.report.metadata ?? {}) as PlagiarismReportMetadata;
  const [showSystemSummary, setShowSystemSummary] = useState(false);

  const artwork: MatchedArtworkRef | null =
    detail.matched_artwork ??
    (detail.reported_art_post?.registered_arts
      ? detail.reported_art_post.registered_arts
      : null);

  const similarity =
    typeof meta.similarity_percentage === "number"
      ? meta.similarity_percentage
      : null;
  const thumbnail =
    artwork?.c_secure_url ?? meta.matched_artwork_image_url ?? null;
  const uploadedImageUrl = meta.original_artwork_url ?? null;
  const title = artwork?.title ?? meta.matched_artwork_title ?? "Registered artwork";
  const viewUrl = meta.matched_url ?? null;
  const proof = meta.reporter_proof ?? null;
  const details = meta.reporter_details ?? null;

  // Legacy rows (created before the reporter form) stored the detection summary
  // as the description. Keep it available, but collapsed, behind an expander.
  const legacyDescription =
    !proof && detail.report.description ? detail.report.description : null;

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <ScanSearch size={13} />
          Copyright Report — Plagiarism Detection
        </h4>
        {similarity !== null && (
          <span className={`text-sm font-bold tabular-nums ${similarityTone(similarity)}`}>
            {similarity.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Side-by-side comparison: the artwork the reporter uploaded (the reported
          copy) next to the registered artwork that was matched. Without both,
          an admin cannot tell which is which. */}
      <div className="grid grid-cols-2 gap-2">
        <ArtworkTile
          label="Uploaded artwork (reported copy)"
          imageUrl={uploadedImageUrl}
          caption={meta.original_artwork_title ?? "Submitted by the reporter"}
          emptyHint="Not attached"
        />
        <ArtworkTile
          label="Matched registered artwork"
          imageUrl={thumbnail}
          caption={
            artwork?.status
              ? `${title} · ${artwork.status}`
              : title
          }
          emptyHint="Not available"
          href={viewUrl}
        />
      </div>

      {similarity !== null && (
        <p className="text-center text-xs text-muted-foreground">
          Reported as{" "}
          <span className={`font-semibold tabular-nums ${similarityTone(similarity)}`}>
            {similarity.toFixed(1)}%
          </span>{" "}
          visually similar
        </p>
      )}

      {!uploadedImageUrl && (
        <p className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] leading-relaxed text-muted-foreground">
          <AlertCircle size={12} className="mt-0.5 shrink-0 text-amber-500" />
          The reporter&apos;s upload was not attached to this report. Request
          evidence from the reporter before deciding.
        </p>
      )}

      {/* Detection evidence */}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {similarity !== null && (
          <div className="min-w-0">
            <dt className="text-muted-foreground">Similarity</dt>
            <dd className={`font-semibold tabular-nums ${similarityTone(similarity)}`}>
              {similarity.toFixed(1)}%
            </dd>
          </div>
        )}
        <div className="min-w-0">
          <dt className="text-muted-foreground">Match source</dt>
          <dd className="truncate font-medium">
            {meta.source === "registered_arts"
              ? "Registered Artwork Database"
              : (meta.source ?? "Registered Artwork Database")}
          </dd>
        </div>
        {meta.original_hash && (
          <div className="col-span-2 min-w-0">
            <dt className="text-muted-foreground">Original perceptual hash</dt>
            <dd className="flex items-center gap-1 font-mono text-[11px] break-all">
              <Copy size={11} className="shrink-0 text-muted-foreground" />
              {meta.original_hash}
            </dd>
          </div>
        )}
        {meta.detected_at && (
          <div className="min-w-0">
            <dt className="text-muted-foreground">Detected</dt>
            <dd className="font-medium">{formatDate(meta.detected_at)}</dd>
          </div>
        )}
        {detail.report.related_scan_id && (
          <div className="min-w-0">
            <dt className="text-muted-foreground">Scan reference</dt>
            <dd className="font-mono text-[11px] break-all">
              {truncateHash(detail.report.related_scan_id, 8)}
            </dd>
          </div>
        )}
        {viewUrl && (
          <div className="col-span-2 min-w-0">
            <dt className="text-muted-foreground">Matched artwork link</dt>
            <dd>
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2 hover:opacity-75"
              >
                Open matched artwork <ExternalLink size={11} />
              </a>
            </dd>
          </div>
        )}
      </dl>

      {/* Reporter statement */}
      {(proof || details) && (
        <div className="space-y-2 rounded-md border bg-background p-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <User size={11} /> Reporter statement
          </p>
          {proof && (
            <div>
              <p className="text-[10px] text-muted-foreground">Original source / proof</p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{proof}</p>
            </div>
          )}
          {details && (
            <div>
              <p className="text-[10px] text-muted-foreground">Additional details</p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{details}</p>
            </div>
          )}
        </div>
      )}

      {/* Legacy detection summary (reports created before the reporter form) */}
      {legacyDescription && (
        <div className="rounded-md border bg-background">
          <button
            type="button"
            onClick={() => setShowSystemSummary((v) => !v)}
            className="flex w-full items-center justify-between px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50"
          >
            System detection summary
            {showSystemSummary ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showSystemSummary && (
            <p className="whitespace-pre-wrap break-words px-2.5 pb-2.5 text-xs text-muted-foreground">
              {legacyDescription}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

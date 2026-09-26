"use client";

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/client-utils";
import type { SearchMatch } from "../types";
import { SimilarityRing } from "./SimilarityRing";
import { EvidenceNote } from "./EvidenceNote";
import {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  getEvidenceDetail,
  isLowContent,
  getTransformEvidenceStatus,
  getBlockEvidenceStatus,
} from "../lib/match-metrics";
import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import {
  DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  getSimilarityRiskLabel,
} from "../lib/similarity-risk";

export type RegisteredArtworkMatchVariant =
  | "summary"
  | "detailed"
  | "blocked-registration";

interface RegisteredArtworkMatchProps {
  match: SearchMatch;
  variant?: RegisteredArtworkMatchVariant;
  thresholds?: SimilarityRiskThresholds;
}

export function RegisteredArtworkMatch({
  match,
  variant = "detailed",
  thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
}: RegisteredArtworkMatchProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const score = getPrimaryScore(match);
  const noEvidence = isNoEvidenceMatch(match);
  const evidence = getEvidenceSummary(match);
  const evidenceDetail = getEvidenceDetail(match);
  const lowContent = isLowContent(match);
  const transformEvidenceStatus = getTransformEvidenceStatus(match);
  const blockEvidenceStatus = getBlockEvidenceStatus(match);
  const artworkId = match.url;
  const imageUrl = match.imageUrl ?? null;
  const similarityLabel = getSimilarityRiskLabel(score, thresholds);
  const matchedRegions =
    match.block_agreements !== undefined ? `${match.block_agreements} of 5` : null;
  const transformVariants =
    match.transform_agreements !== undefined ? `${match.transform_agreements} of 6` : null;

  const ring = noEvidence ? (
    <div className="flex h-[110px] w-[110px] flex-col items-center justify-center gap-1.5 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 px-2 text-center">
      <ShieldCheck size={20} className="text-emerald-400" />
      <p className="text-[9px] font-semibold leading-tight text-emerald-400">
        No significant similarity found
      </p>
    </div>
  ) : (
    <SimilarityRing value={score} size={110} thresholds={thresholds} />
  );

  const preview = imageUrl ? (
    <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border bg-muted sm:h-40">
      <Image
        src={imageUrl}
        alt={match.title ?? "Matched registered artwork"}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  ) : null;

  const viewAction =
    match.communityUrl || imageUrl ? (
      <div>
        {match.communityUrl ? (
          <Link
            href={match.communityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium underline underline-offset-2 hover:opacity-75 transition-opacity"
          >
            View Registered Artwork
            <ExternalLink size={12} className="shrink-0" />
          </Link>
        ) : (
          <a
            href={imageUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium underline underline-offset-2 hover:opacity-75 transition-opacity"
          >
            View Registered Artwork
            <ExternalLink size={12} className="shrink-0" />
          </a>
        )}
      </div>
    ) : null;

  const matchInfo = (
    <div className="rounded-xl border border-border bg-background/50 p-3.5 space-y-2.5">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Match Information
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <InfoField
          label="Source"
          value="Registered Artwork Database"
          icon={<Database size={12} className="text-indigo-400" />}
        />
        {matchedRegions && (
          <InfoField label="Matched Regions" value={matchedRegions} />
        )}
        {transformVariants && (
          <InfoField label="Transform Variants" value={transformVariants} />
        )}
      </div>
      <EvidenceNote
        evidence={evidence}
        evidenceDetail={evidenceDetail}
        lowContent={lowContent}
        transformEvidenceStatus={transformEvidenceStatus}
        blockEvidenceStatus={blockEvidenceStatus}
      />
    </div>
  );

  const technicalDetails = (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setShowTechnical((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/50 transition-colors"
      >
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Technical Details
        </p>
        {showTechnical ? (
          <ChevronDown size={14} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={14} className="text-muted-foreground" />
        )}
      </button>
      {showTechnical && (
        <div className="border-t border-border px-3.5 py-3 space-y-2">
          <InfoField label="Artwork ID" value={artworkId} mono />
          {match.licenseName && (
            <InfoField label="License" value={match.licenseName} />
          )}
        </div>
      )}
    </div>
  );

  if (variant === "summary") {
    return (
      <div className="flex items-center gap-3 p-4">
        {imageUrl && (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={imageUrl}
              alt={match.title ?? "Matched artwork"}
              width={56}
              height={56}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {match.title ?? match.source}
          </p>
          {match.authorName && (
            <p className="text-xs text-muted-foreground">by {match.authorName}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-foreground">
            {score.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground">{similarityLabel}</p>
        </div>
      </div>
    );
  }

  if (variant === "blocked-registration") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-destructive">
            <AlertTriangle size={15} /> Registration Blocked
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            A registered artwork with significant visual similarity was found
            during the plagiarism check.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Database size={15} className="text-indigo-400" />
            <p className="font-semibold text-base text-foreground">
              Registered Artwork Match
            </p>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-4">
              {ring}
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {score.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">{similarityLabel}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {preview}
              {match.title && (
                <p className="text-xl font-semibold text-foreground leading-snug">
                  {match.title}
                </p>
              )}
              {match.authorName && (
                <p className="text-sm text-muted-foreground">
                  by {match.authorName}
                </p>
              )}
              {!match.title && !match.authorName && (
                <p className="text-sm font-semibold text-foreground break-all">
                  {match.source}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-3.5">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2.5">
                Matched Artwork
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <InfoField label="Artwork" value={match.title ?? "Not available"} />
                <InfoField
                  label="Author"
                  value={match.authorName ?? "Not available"}
                />
                <InfoField
                  label="Registration Date"
                  value={
                    match.registeredAt
                      ? formatDate(match.registeredAt)
                      : "Not available"
                  }
                />
                <InfoField
                  label="Registration Status"
                  value={humanizeStatus(match.status)}
                />
                <InfoField
                  label="License"
                  value={match.licenseName ?? "Not available"}
                />
                <InfoField
                  label="Source"
                  value="Registered Artwork Database"
                  icon={<Database size={12} className="text-indigo-400" />}
                />
              </div>
            </div>

            {matchInfo}
            {technicalDetails}
            {viewAction}

            <div className="rounded-xl border border-border bg-background/50 p-3.5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your artwork was compared against registered artworks using
                perceptual hash similarity. This result indicates visual
                similarity with an existing registered artwork and is provided
                for further review.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // detailed (default)
  return (
    <div className="p-4 space-y-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="shrink-0 sm:self-start">{ring}</div>
        <div className="flex-1 min-w-0 space-y-2.5">
          {preview}
          {match.title && (
            <p className="text-lg font-semibold text-foreground leading-snug">
              {match.title}
            </p>
          )}
          {match.authorName && (
            <p className="text-sm text-muted-foreground">by {match.authorName}</p>
          )}
          {!match.title && !match.authorName && (
            <p className="text-sm font-semibold text-foreground break-all">
              {match.source}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {match.registeredAt && (
              <span>Registered {formatDate(match.registeredAt)}</span>
            )}
            {match.status && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {humanizeStatus(match.status)}
              </span>
            )}
          </div>
        </div>
      </div>

      {viewAction}
      {matchInfo}
      {technicalDetails}
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-foreground flex items-center gap-1.5 break-all ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}

function humanizeStatus(status: string | null | undefined): string {
  if (!status) return "Not available";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft } from "lucide-react";
import Image from "next/image";
import type { SearchResponse } from "../types";
import { ArtworkMatchCard } from "./artwork-match-card";
import { OtherMatches } from "./other-matches";
import { PerceptualHashDetails } from "./perceptual-hash-details";
import { OnlineCheckChip, WebOnlineStatus } from "./WebOnlineStatus";
import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import { DEFAULT_SIMILARITY_RISK_THRESHOLDS } from "../lib/similarity-risk";

interface WebModeResultProps {
  preview: string;
  result: SearchResponse;
  onRetry?: () => void;
  onBackToSummary?: () => void;
  thresholds?: SimilarityRiskThresholds;
  /** Original file being checked (external reviews upload it as evidence). */
  originalFile?: File | null;
  /** Persisted similarity scan id, when available (upload flow). */
  scanId?: string | null;
}

function NoMatchNote() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3 text-muted-foreground">
      <AlertCircle size={15} className="shrink-0" />
      <p className="text-base">No significant similarity found.</p>
    </div>
  );
}

export function WebModeResult({
  preview,
  result,
  onRetry,
  onBackToSummary,
  thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  originalFile,
  scanId,
}: WebModeResultProps) {
  const hasWebDiagnostics = !!result.web_diagnostics;
  const isBestDb = result.best_match?.type === "database";

  return (
    <div className="space-y-5">
      {/* Context header */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 sm:p-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={preview}
            alt="Submitted artwork"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Detailed Analysis
          </p>
          <p className="font-semibold text-base text-foreground truncate">
            {result.filename}
          </p>
          <p className="text-sm text-muted-foreground">
            Online sources, registered artwork, and perceptual hash details.
          </p>
        </div>
        {onBackToSummary && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={onBackToSummary}
          >
            <ChevronLeft size={13} /> Back to Summary
          </Button>
        )}
      </div>

      {/* Low content warning */}
      {result.low_content_warning && (
        <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl px-5 py-3 flex items-center gap-2.5 text-amber-500/90">
          <AlertCircle size={15} className="shrink-0" />
          <p className="text-sm">
            Low image detail detected in the uploaded artwork — these results may
            be less reliable.
          </p>
        </div>
      )}

      {/* Online Sources */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-foreground">Online Sources</p>
          <OnlineCheckChip result={result} />
        </div>
        {hasWebDiagnostics && <WebOnlineStatus result={result} onRetry={onRetry} />}
        {result.web ? (
          <ArtworkMatchCard
            match={result.web}
            sourceType="web"
            isBest={!isBestDb}
            thresholds={thresholds}
            originalFile={originalFile}
            originalPreviewUrl={preview}
            filename={result.filename}
            originalHash={result.original_hash}
            scanId={scanId}
          />
        ) : !hasWebDiagnostics ? (
          <NoMatchNote />
        ) : result.web_diagnostics?.status === "degraded" ||
          result.web_diagnostics?.status === "not_attempted" ? null : (
          <NoMatchNote />
        )}
      </section>

      {/* Registered Artwork */}
      <section className="space-y-3">
        <p className="text-base font-semibold text-foreground">Registered Artwork</p>
        {result.db ? (
          <ArtworkMatchCard
            match={result.db}
            sourceType="registered_artwork"
            isBest={isBestDb}
            thresholds={thresholds}
            originalFile={originalFile}
            originalPreviewUrl={preview}
            filename={result.filename}
            originalHash={result.original_hash}
            scanId={scanId}
          />
        ) : (
          <NoMatchNote />
        )}
      </section>

      {/* Other Matches */}
      {result.other_matches.length > 0 && (
        <OtherMatches matches={result.other_matches} />
      )}

      {/* Perceptual Hash Details */}
      <PerceptualHashDetails
        transforms={result.hashes.transforms}
        blocks={result.hashes.blocks}
      />
    </div>
  );
}

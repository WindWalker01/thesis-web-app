"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database, Globe, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { SearchResponse } from "../types";
import { SimilarityRing } from "./SimilarityRing";
import { SimilarityTooltip } from "./similarity-tooltip";
import { EvidenceNote } from "./EvidenceNote";
import {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  isLowContent,
} from "../lib/match-metrics";
import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import { DEFAULT_SIMILARITY_RISK_THRESHOLDS } from "../lib/similarity-risk";
import { buildMatchContext } from "../lib/match-source";
import { MatchActionButton } from "./match-action-button";

interface SimilaritySummaryProps {
  preview: string;
  filename: string;
  result: SearchResponse;
  thresholds?: SimilarityRiskThresholds;
  onViewAnalysis: () => void;
  onReset: () => void;
  /** Original file being checked (external reviews upload it as evidence). */
  originalFile?: File | null;
  /** Persisted similarity scan id, when available (upload flow). */
  scanId?: string | null;
}

function sourceLabel(type: string | undefined): string {
  if (type === "database") return "Registered Artwork Database";
  if (type === "internet") return "Online Source";
  return "Other Source";
}

export function SimilaritySummary({
  preview,
  filename,
  result,
  thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  onViewAnalysis,
  onReset,
  originalFile,
  scanId,
}: SimilaritySummaryProps) {
  const best = result.best_match ?? null;
  const score = getPrimaryScore(best);
  const noEvidence = isNoEvidenceMatch(best);
  const hasMatch = !!best && !noEvidence;
  const isDb = best?.type === "database";
  const bestContext = buildMatchContext(best, {
    originalHash: result.original_hash,
    scanId,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
          Plagiarism Analysis
        </h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Your artwork was compared against registered artworks and available
          online sources.
        </p>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* Submitted artwork */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Your artwork
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
              {filename}
            </p>
          </div>
          <div className="relative h-56 w-full bg-muted">
            <Image
              src={preview}
              alt="Submitted artwork"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* Connector: score + tooltip */}
        <div className="flex flex-row items-center justify-center gap-4 px-2 lg:flex-col">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase text-center">
            Best Match
          </p>
          {hasMatch ? (
            <SimilarityRing value={score} size={120} thresholds={thresholds} />
          ) : (
            <div className="flex h-[120px] w-[120px] flex-col items-center justify-center gap-1.5 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 px-2 text-center">
              <ShieldCheck size={22} className="text-emerald-400" />
              <p className="text-[9px] font-semibold leading-tight text-emerald-400">
                No significant similarity found
              </p>
            </div>
          )}
          <SimilarityTooltip />
        </div>
        {/* Best match */}
        {hasMatch ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Strongest match
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  isDb
                    ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                    : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                }`}
              >
                {isDb ? (
                  <Database size={9} className="mr-1" />
                ) : (
                  <Globe size={9} className="mr-1" />
                )}
                {sourceLabel(best?.type)}
              </Badge>
            </div>

            {best?.imageUrl && (
              <div className="relative h-56 w-full bg-muted">
                <Image
                  src={best.imageUrl}
                  alt={best.title ?? "Matched artwork"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}

            <div className="space-y-2 p-4">
              {best?.title && (
                <p className="text-base font-semibold text-foreground">
                  {best.title}
                </p>
              )}
              {best?.authorName && (
                <p className="text-sm text-muted-foreground">
                  by {best.authorName}
                </p>
              )}
              {!best?.title && !best?.authorName && (
                <p className="text-sm font-semibold text-foreground break-all">
                  {best?.source}
                </p>
              )}

              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-0.5">
                  Source
                </p>
                <p className="text-sm text-foreground font-medium">
                  {sourceLabel(best?.type)}
                </p>
              </div>

              <EvidenceNote
                evidence={noEvidence ? getEvidenceSummary(best) : null}
                lowContent={isLowContent(best) || result.low_content_warning === true}
                className="pt-0.5"
              />
            </div>

            {/* Best-match action — driven by the match source, not the score */}
            {hasMatch && bestContext && (
              <div className="border-t border-border px-4 py-3.5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-prose">
                    {isDb
                      ? "This best match is registered on ArtForgeLab. If you believe this may constitute a copyright concern, you can report it for review."
                      : "This best match was found outside ArtForgeLab. You can request a manual review so the result can be investigated."}
                  </p>
                  <MatchActionButton
                    context={bestContext}
                    originalFile={originalFile}
                    filename={filename}
                    size="sm"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center">
            <ShieldCheck size={28} className="text-emerald-400" />
            <p className="text-base font-semibold text-foreground">
              No significant similarity found
            </p>
            <p className="text-sm text-muted-foreground">
              No registered artwork or online source exceeded the similarity
              threshold.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="w-full h-12 gap-2.5 px-8 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 sm:w-auto sm:min-w-[240px]"
          onClick={onViewAnalysis}
        >
          View Analysis <ArrowRight size={18} />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 sm:w-auto"
          onClick={onReset}
        >
          New Analysis
        </Button>
      </div>
    </div>
  );
}

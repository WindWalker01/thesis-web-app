"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Hash, AlertCircle, ChevronDown, ChevronRight, Globe, Database, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SearchResponse, OtherSearchMatch } from "../types";
import { MatchCard } from "./MatchCard";
import { HashTable } from "./HashTable";
import { SimilarityRing } from "./SimilarityRing";
import { EvidenceNote } from "./EvidenceNote";
import { OnlineCheckChip, WebOnlineStatus } from "./WebOnlineStatus";
import {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  isLowContent,
} from "../lib/match-metrics";
import Link from "next/link";
import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import { DEFAULT_SIMILARITY_RISK_THRESHOLDS } from "../lib/similarity-risk";

interface WebModeResultProps {
  preview: string;
  result: SearchResponse;
  /** Re-fires the same upload (used for the degraded-state Retry button). */
  onRetry?: () => void;
  /** Admin-synced thresholds (critical = red, moderate = amber). Defaults to shared fallbacks. */
  thresholds?: SimilarityRiskThresholds;
}

function NoMatchNote({ label }: { label: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3 text-muted-foreground">
      <AlertCircle size={15} className="shrink-0" />
      <p className="text-base">No {label} match found.</p>
    </div>
  );
}

function OtherMatchesSection({ matches }: { matches: OtherSearchMatch[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={15} className="text-muted-foreground" /> : <ChevronRight size={15} className="text-muted-foreground" />}
          <p className="font-semibold text-base text-foreground">Other Matches</p>
          <Badge variant="secondary" className="text-[10px] ml-1">
            {matches.length}
          </Badge>
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-border">
          {matches.map((match, idx) => {
            const isDb = !!match.artwork_id;
            return (
              <div key={idx} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDb ? "bg-indigo-500/15 text-indigo-400" : "bg-sky-500/15 text-sky-400"
                }`}>
                  {isDb ? <Database size={14} /> : <Globe size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{match.source}</p>
                    <Badge variant="outline" className="text-[9px] capitalize">
                      {isDb ? "database" : "internet"}
                    </Badge>
                  </div>
                  <a
                    href={match.link ?? match.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground font-mono truncate block mt-0.5 hover:text-primary transition-colors"
                  >
                    {match.link ?? match.url}
                  </a>
                </div>
                <div className="shrink-0 sm:text-right">
                  {isNoEvidenceMatch(match) ? (
                    <>
                      <p className="text-sm font-semibold text-emerald-400">No plagiarism match found</p>
                      <EvidenceNote evidence={getEvidenceSummary(match)} lowContent={isLowContent(match)} className="sm:items-end" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-foreground">{getPrimaryScore(match).toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">confidence</p>
                      <EvidenceNote evidence={getEvidenceSummary(match)} lowContent={isLowContent(match)} className="sm:items-end" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function WebModeResult({ preview, result, onRetry, thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS }: WebModeResultProps) {
  const hasWebDiagnostics = !!result.web_diagnostics;

  // The third card always shows the best match — whichever scored higher
  const isBestDb = result.best_match?.type === "database";
  const bestMatch = isBestDb ? result.db : result.web;
  const bestScore = getPrimaryScore(result.best_match);
  const bestNoEvidence = isNoEvidenceMatch(result.best_match);
  const bestEvidence = getEvidenceSummary(result.best_match);
  const bestLowContent = isLowContent(result.best_match) || result.low_content_warning === true;

  return (
    <div className="space-y-5">
      {/* v2: uploaded image as a whole lacked content-bearing blocks */}
      {result.low_content_warning && (
        <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl px-5 py-3 flex items-center gap-2.5 text-amber-500/90">
          <TriangleAlert size={15} className="shrink-0" />
          <p className="text-sm">
            Low image detail detected in the uploaded artwork — these results may be less reliable.
          </p>
        </div>
      )}
      {/* Top row: submitted image + best match ring + best match summary */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">

        {/* Submitted image */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div>
              <p className="font-semibold text-base text-foreground">Submitted Artwork</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{result.filename}</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
              <ShieldCheck size={11} className="mr-1" /> Analyzed
            </Badge>
          </div>
          <Image src={preview} alt="Submitted artwork" width={480} height={220} className="h-44 w-full object-cover sm:h-52" />
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">FILENAME</p>
              <p className="text-base text-foreground font-mono truncate">{result.filename}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">ORIGINAL HASH</p>
              <p className="text-sm text-primary font-mono">{result.original_hash}</p>
            </div>
          </div>
        </div>

        {/* Best match ring */}
        {result.best_match ? (
          <div className="bg-card border border-border rounded-2xl p-5 flex w-full flex-col items-center gap-4 sm:mx-auto sm:w-56 lg:w-48">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground text-center">BEST MATCH</p>
            {bestNoEvidence ? (
              <div className="flex h-[130px] w-[130px] flex-col items-center justify-center gap-2 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 px-3 text-center">
                <ShieldCheck size={26} className="text-emerald-400" />
                <p className="text-[10px] font-semibold leading-tight text-emerald-400">
                  No plagiarism match found
                </p>
              </div>
            ) : (
              <SimilarityRing value={bestScore} size={130} thresholds={thresholds} />
            )}
            <EvidenceNote
              evidence={bestNoEvidence ? bestEvidence : null}
              lowContent={bestLowContent}
              className="text-center"
            />
            <div className="w-full text-center space-y-1.5">
              <p className="text-sm font-semibold text-foreground">{result.best_match.source}</p>
              <Badge
                variant="outline"
                className={`text-[10px] capitalize ${isBestDb
                  ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                  : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                  }`}
              >
                {result.best_match.type}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 flex w-full flex-col items-center justify-center gap-3 text-center min-h-[180px] sm:mx-auto sm:w-56 lg:w-48">
            <AlertCircle size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No matches found</p>
          </div>
        )}

        {/* Best match summary card — DB: show image | Internet: show source + URL */}
        {bestMatch ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <p className="font-semibold text-base text-foreground">
                  {isBestDb ? "Database Match" : "Web Match"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{bestMatch.source}</p>
              </div>
              <div className="flex items-center gap-2">
                {isNoEvidenceMatch(bestMatch) ? (
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    <ShieldCheck size={9} className="mr-1" /> No evidence
                  </Badge>
                ) : (
                  <SimilarityRing value={getPrimaryScore(bestMatch)} size={52} />
                )}
              </div>
            </div>

            {/* DB best match: render the registered artwork image */}
            {isBestDb && bestMatch.imageUrl ? (
              <div className="relative h-40 w-full bg-muted sm:h-44">
                <Image
                  src={bestMatch.imageUrl}
                  alt={bestMatch.title ?? "Registered artwork"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="p-5 space-y-3">
              {/* DB: show resolved title */}
              {isBestDb && bestMatch.title && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">TITLE</p>
                  <p className="text-sm text-foreground font-medium">{bestMatch.title}</p>
                </div>
              )}

              {/* DB: Cloudinary image URL or fallback UUID */}
              {isBestDb && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">IMAGE URL</p>
                  {bestMatch.imageUrl ? (
                    <Link
                      href={bestMatch.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary font-mono break-all underline underline-offset-2 hover:opacity-75 transition-opacity"
                    >
                      {bestMatch.imageUrl}
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono break-all">{bestMatch.url}</p>
                  )}
                </div>
              )}

              {/* Internet: source page link */}
              {!isBestDb && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">SOURCE URL</p>
                  <a
                    href={bestMatch.link ?? bestMatch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary font-mono break-all underline underline-offset-2 hover:opacity-75 transition-opacity"
                  >
                    {bestMatch.link ?? bestMatch.url}
                  </a>
                </div>
              )}

              {/* Internet: direct asset URL (only if different from link) */}
              {!isBestDb && bestMatch.link && bestMatch.url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">ASSET URL</p>
                  <a
                    href={bestMatch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground font-mono break-all underline underline-offset-2 hover:opacity-75 transition-opacity"
                  >
                    {bestMatch.url}
                  </a>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">TYPE</p>
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${isBestDb
                    ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                    : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                    }`}
                >
                  {bestMatch.type}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-3 text-muted-foreground">
            <AlertCircle size={15} className="shrink-0" />
            <p className="text-base">No match found.</p>
          </div>
        )}
      </div>

      {/* Web match full card — status-driven; db always renders below */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Online sources</p>
          <OnlineCheckChip result={result} />
        </div>
        {hasWebDiagnostics && <WebOnlineStatus result={result} onRetry={onRetry} />}
        {result.web ? (
          <MatchCard match={result.web} isBest={!isBestDb} thresholds={thresholds} />
        ) : !hasWebDiagnostics ? (
          <NoMatchNote label="web" />
        ) : result.web_diagnostics?.status === "degraded" ||
          result.web_diagnostics?.status === "not_attempted" ? null : (
          <NoMatchNote label="web" />
        )}
      </div>

      {/* DB match full card */}
      {result.db
        ? <MatchCard match={result.db} isBest={isBestDb} thresholds={thresholds} />
        : <NoMatchNote label="database" />
      }

      {/* Other matches (non-best) */}
      {result.other_matches.length > 0 && (
        <OtherMatchesSection matches={result.other_matches} />
      )}

      {/* Hash tables */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-6 sm:p-6">
        <div className="flex items-center gap-2">
          <Hash size={15} className="text-primary" />
          <p className="font-semibold text-foreground">Perceptual Hash Details</p>
        </div>
        <HashTable
          title="Transform Variants (0°, 90°, 180°, 270°, Mirror, Flip)"
          hashes={result.hashes.transforms}
        />
        <HashTable
          title="Block Regions (Multi-Scale: 0.625, 0.75, 1.0)"
          hashes={result.hashes.blocks}
        />
      </div>
    </div>
  );
}
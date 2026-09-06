import { Badge } from "@/components/ui/badge";
import { Database, Globe, ExternalLink, Trophy, ShieldCheck } from "lucide-react";
import { SearchMatch } from "../types";
import { SimilarityRing } from "./SimilarityRing";
import {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  isLowContent,
} from "../lib/match-metrics";
import { EvidenceNote } from "./EvidenceNote";

interface MatchCardProps {
  match: SearchMatch;
  isBest?: boolean;
}

function getRiskBadge(similarity: number) {
  if (similarity >= 85) return { label: "Critical Match", className: "text-red-400 border-red-500/30 bg-red-500/10" };
  if (similarity >= 60) return { label: "Moderate Match", className: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
  return { label: "Low Match", className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
}

export function MatchCard({ match, isBest }: MatchCardProps) {
  const isDb = match.type === "database";
  // v2 primary score: percentile-calibrated confidence (falls back to
  // `similarity` on legacy responses). `raw_similarity_legacy` is never shown.
  const score = getPrimaryScore(match);
  const risk = getRiskBadge(score);
  const noEvidence = isNoEvidenceMatch(match);
  const evidence = getEvidenceSummary(match);
  const lowContent = isLowContent(match);
  const href = match.link ?? match.url;

  return (
    <div className={`bg-card rounded-2xl border overflow-hidden transition-all ${
      isBest ? "border-primary/40 shadow-sm shadow-primary/10" : "border-border"
    }`}>
      {/* Header */}
      <div className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5 border-b ${
        isBest ? "bg-primary/5 border-primary/20" : "border-border"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isDb ? "bg-indigo-500/15 text-indigo-400" : "bg-sky-500/15 text-sky-400"
          }`}>
            {isDb ? <Database size={15} /> : <Globe size={15} />}
          </div>
          <div>
            <p className="font-semibold text-base text-foreground">{match.source}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{match.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isBest && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1">
              <Trophy size={9} /> Best Match
            </Badge>
          )}
          <Badge variant="outline" className={`text-[10px] ${risk.className}`}>
            {risk.label}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        {/* Ring — or an explicit "no evidence" state for a clean negative */}
        <div className="shrink-0 sm:self-start">
          {noEvidence ? (
            <div className="flex h-[100px] w-[100px] flex-col items-center justify-center gap-1.5 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 px-2 text-center">
              <ShieldCheck size={20} className="text-emerald-400" />
              <p className="text-[9px] font-semibold leading-tight text-emerald-400">
                No plagiarism match found
              </p>
            </div>
          ) : (
            <SimilarityRing value={score} size={100} />
          )}
          <EvidenceNote evidence={evidence} lowContent={lowContent} className="mt-2 max-w-[140px]" />
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
              {isDb ? "DATABASE URL" : "SOURCE LINK"}
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-mono underline-offset-2 hover:underline flex items-center gap-1 break-all"
            >
              {href.length > 60 ? href.slice(0, 60) + "…" : href}
              <ExternalLink size={10} className="shrink-0" />
            </a>
          </div>

          {match.link && (
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">ASSET URL</p>
              <a
                href={match.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground font-mono underline-offset-2 hover:underline break-all"
              >
                {match.url.length > 60 ? match.url.slice(0, 60) + "…" : match.url}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

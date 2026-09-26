import { ShieldCheck, ExternalLink } from "lucide-react";
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
import { DEFAULT_SIMILARITY_RISK_THRESHOLDS } from "../lib/similarity-risk";

interface WebSourceMatchProps {
  match: SearchMatch;
  thresholds?: SimilarityRiskThresholds;
}

export function WebSourceMatch({
  match,
  thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
}: WebSourceMatchProps) {
  const score = getPrimaryScore(match);
  const noEvidence = isNoEvidenceMatch(match);
  const evidence = getEvidenceSummary(match);
  const evidenceDetail = getEvidenceDetail(match);
  const lowContent = isLowContent(match);
  const transformEvidenceStatus = getTransformEvidenceStatus(match);
  const blockEvidenceStatus = getBlockEvidenceStatus(match);

  const href = match.link ?? match.url;

  return (
    <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <div className="shrink-0 sm:self-start">
        {noEvidence ? (
          <div className="flex h-[110px] w-[110px] flex-col items-center justify-center gap-1.5 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 px-2 text-center">
            <ShieldCheck size={20} className="text-emerald-400" />
            <p className="text-[9px] font-semibold leading-tight text-emerald-400">
              No significant similarity found
            </p>
          </div>
        ) : (
          <SimilarityRing value={score} size={110} thresholds={thresholds} />
        )}
        <EvidenceNote
          evidence={evidence}
          evidenceDetail={evidenceDetail}
          lowContent={lowContent}
          transformEvidenceStatus={transformEvidenceStatus}
          blockEvidenceStatus={blockEvidenceStatus}
          className="mt-2 max-w-[140px]"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
            SOURCE LINK
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

        {match.link && match.url && match.link !== match.url && (
          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
              ASSET URL
            </p>
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
  );
}

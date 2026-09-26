import { Badge } from "@/components/ui/badge";
import { Database, Globe, Trophy } from "lucide-react";
import type { SearchMatch } from "../types";
import { getPrimaryScore } from "../lib/match-metrics";
import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import {
  DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  getSimilarityRiskTier,
} from "../lib/similarity-risk";
import { RegisteredArtworkMatch } from "./registered-artwork-match";
import { WebSourceMatch } from "./web-source-match";

export type ArtworkMatchSourceType = "registered_artwork" | "web" | "other";

interface ArtworkMatchCardProps {
  match: SearchMatch;
  /** Explicit source type; defaults to a value derived from `match.type`. */
  sourceType?: ArtworkMatchSourceType;
  isBest?: boolean;
  thresholds?: SimilarityRiskThresholds;
}

const SOURCE_TITLES: Record<ArtworkMatchSourceType, string> = {
  registered_artwork: "Registered Artwork",
  web: "Web Source",
  other: "Other Match",
};

function resolveSourceType(match: SearchMatch): ArtworkMatchSourceType {
  if (match.type === "database") return "registered_artwork";
  if (match.type === "internet") return "web";
  return "other";
}

function getRiskBadge(
  similarity: number,
  thresholds: SimilarityRiskThresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
) {
  const tier = getSimilarityRiskTier(similarity, thresholds);
  if (tier === "critical")
    return {
      label: "High similarity",
      className: "text-red-400 border-red-500/30 bg-red-500/10",
    };
  if (tier === "moderate")
    return {
      label: "Moderate similarity",
      className: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    };
  return {
    label: "Low similarity",
    className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };
}

/**
 * Data-driven match card. Renders registered-artwork, web, or other matches
 * from a single component, driven by `sourceType`.
 */
export function ArtworkMatchCard({
  match,
  sourceType,
  isBest,
  thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
}: ArtworkMatchCardProps) {
  const type = sourceType ?? resolveSourceType(match);
  const isRegistered = type === "registered_artwork";
  const risk = getRiskBadge(getPrimaryScore(match), thresholds);

  return (
    <div
      className={`bg-card rounded-2xl border overflow-hidden transition-all ${
        isBest ? "border-primary/40 shadow-sm shadow-primary/10" : "border-border"
      }`}
    >
      {/* Header */}
      <div
        className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5 border-b ${
          isBest ? "bg-primary/5 border-primary/20" : "border-border"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isRegistered
                ? "bg-indigo-500/15 text-indigo-400"
                : "bg-sky-500/15 text-sky-400"
            }`}
          >
            {isRegistered ? <Database size={15} /> : <Globe size={15} />}
          </div>
          <p className="font-semibold text-base text-foreground">
            {SOURCE_TITLES[type]}
          </p>
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
      {isRegistered ? (
        <RegisteredArtworkMatch match={match} thresholds={thresholds} />
      ) : (
        <WebSourceMatch match={match} thresholds={thresholds} />
      )}
    </div>
  );
}

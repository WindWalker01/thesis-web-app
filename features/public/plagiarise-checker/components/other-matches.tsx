"use client";

import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Database, Globe } from "lucide-react";
import { useState } from "react";
import type { OtherSearchMatch } from "../types";
import { EvidenceNote } from "./EvidenceNote";
import {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  isLowContent,
} from "../lib/match-metrics";

export function OtherMatches({ matches }: { matches: OtherSearchMatch[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={15} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={15} className="text-muted-foreground" />
          )}
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
              <div
                key={idx}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDb
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-sky-500/15 text-sky-400"
                  }`}
                >
                  {isDb ? <Database size={14} /> : <Globe size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {match.source}
                    </p>
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
                      <p className="text-sm font-semibold text-emerald-400">
                        No significant similarity found
                      </p>
                      <EvidenceNote
                        evidence={getEvidenceSummary(match)}
                        lowContent={isLowContent(match)}
                        className="sm:items-end"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-foreground">
                        {getPrimaryScore(match).toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        similarity
                      </p>
                      <EvidenceNote
                        evidence={getEvidenceSummary(match)}
                        lowContent={isLowContent(match)}
                        className="sm:items-end"
                      />
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

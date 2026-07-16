"use client";

import { memo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ExternalLink,
  Database,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/client-utils";
import { RiskBadge } from "../RiskBadge";

interface ScanMatch {
  rank?: number;
  similarity_percentage?: number;
  source?: string;
  type?: string;
  link?: string;
  url?: string;
}

interface ScanData {
  id: string;
  best_similarity_percentage: number | null;
  best_source: string | null;
  best_link: string | null;
  best_url: string | null;
  total_matches: number;
  matches: unknown;
}

interface SimilarityAnalysisPanelProps {
  scan: ScanData | null;
}

export const SimilarityAnalysisPanel = memo(function SimilarityAnalysisPanel({ scan }: SimilarityAnalysisPanelProps) {
  const similarity = scan?.best_similarity_percentage ?? null;

  if (!scan) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Similarity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No similarity scan data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const matches = Array.isArray(scan.matches) ? scan.matches as ScanMatch[] : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Similarity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Overall Similarity</span>
              <RiskBadge similarity={similarity} />
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  similarity !== null && similarity >= 95
                    ? "bg-red-500"
                    : similarity !== null && similarity >= 85
                      ? "bg-orange-500"
                      : similarity !== null && similarity >= 75
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                )}
                style={{ width: `${similarity ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Best Match Source</p>
            <p className="text-sm font-semibold capitalize mt-1">
              {scan.best_source ?? "Unknown"}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Matches</p>
            <p className="text-sm font-semibold mt-1">{scan.total_matches}</p>
          </div>
        </div>

        {scan.best_link && (
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Source URL</p>
            <Link
              href={scan.best_link}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1 text-xs break-all underline underline-offset-4"
            >
              {scan.best_link}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
          </div>
        )}

        {/* Matches List */}
        {matches.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">All Matches</p>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {matches.map((match, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {match.type === "database" ? (
                          <Database className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">
                          Match #{match.rank ?? i + 1}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {match.similarity_percentage?.toFixed(1) ?? "N/A"}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {match.source ?? match.type ?? "Unknown source"}
                    </p>
                    {match.link && (
                      <Link
                        href={match.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary inline-flex items-center gap-1 text-[10px] mt-1 underline underline-offset-4"
                      >
                        {match.link.substring(0, 60)}...
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
import Image from "next/image";
import { AlertTriangle, Database, Globe } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SimilarityReport } from "@/features/(user)/upload-artwork/server/art-similarity-scan";
import {
  formatSimilarityValue,
  getMatchTypeLabel,
} from "@/features/(user)/upload-artwork/lib/similarity-display";
import { ReferenceLink } from "@/features/(user)/upload-artwork/components/reference-link";
import { MatchActionButton } from "@/features/plagiarise-checker/components/match-action-button";
import { similarityReportToMatchContext } from "../lib/match-context";

type SimilarityReportSummaryProps = {
  similarityReport: SimilarityReport;
  /** Registered artwork id (present for `under_review` external matches). */
  artworkId?: string | null;
};

/**
 * Success-state similarity report: a compact single-match card summarizing the
 * strongest detected match.
 */
export function SimilarityReportSummary({
  similarityReport,
  artworkId,
}: SimilarityReportSummaryProps) {
  const similarityValue = formatSimilarityValue(
    similarityReport.similarityPercentage,
  );
  const matchTypeLabel = getMatchTypeLabel(similarityReport.type);
  const matchPreviewUrl = similarityReport.previewImageUrl ?? null;
  const matchContext = similarityReportToMatchContext(similarityReport);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Similarity report
        </CardTitle>
        <CardDescription>
          This shows the strongest detected match from either your internal
          artwork database or an online source.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Similarity</p>
            <p className="text-lg font-semibold">{similarityValue}</p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Match type</p>
            <div className="mt-1 flex items-center gap-2">
              {similarityReport.type === "database" ? (
                <Database className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              <p className="text-lg font-semibold">{matchTypeLabel}</p>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Source</p>
            <p className="text-lg font-semibold">
              {similarityReport.source ?? "Unknown"}
            </p>
          </div>
        </div>

        {matchPreviewUrl ? (
          <div className="overflow-hidden rounded-xl border">
            <div className="bg-muted relative aspect-[4/3] w-full">
              <Image
                src={matchPreviewUrl}
                alt="Matched artwork preview"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-base">
            No matched preview image is available for this result.
          </div>
        )}

        {similarityReport.type === "internet" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Reference link</p>
              {similarityReport.link ? (
                <ReferenceLink href={similarityReport.link}>
                  {similarityReport.link}
                </ReferenceLink>
              ) : (
                <p className="text-base">No link available.</p>
              )}
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Image reference</p>
              {similarityReport.url ? (
                <ReferenceLink href={similarityReport.url}>
                  {similarityReport.url}
                </ReferenceLink>
              ) : (
                <p className="text-base">No image URL available.</p>
              )}
            </div>
          </div>
        )}

        {/* Action — internal matches are reportable; external ones go to review */}
        <div className="rounded-lg border p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-prose">
              {similarityReport.type === "database"
                ? "A potentially similar registered artwork was detected. You can report it for review."
                : "A potentially similar external match was detected. You can request a manual review so a reviewer can investigate."}
            </p>
            <MatchActionButton
              context={matchContext}
              size="sm"
              artworkId={artworkId}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

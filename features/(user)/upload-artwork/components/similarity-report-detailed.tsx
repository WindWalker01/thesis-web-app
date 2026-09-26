"use client";

import { AlertTriangle, Database, Globe } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SimilarityReport } from "@/features/(user)/upload-artwork/server/art-similarity-scan";
import type {
  OtherSearchMatch,
  SearchMatch,
} from "@/features/plagiarise-checker/types";
import { RegisteredArtworkMatch } from "@/features/plagiarise-checker/components/registered-artwork-match";
import { MatchActionButton } from "@/features/plagiarise-checker/components/match-action-button";
import { similarityReportToMatchContext } from "../lib/match-context";
import { MatchThumbnail } from "./match-thumbnail";
import { ReferenceLink } from "./reference-link";
import { formatSimilarityValue } from "../lib/similarity-display";

type SimilarityReportDetailedProps = {
  similarityReport: SimilarityReport;
  databaseMatches: OtherSearchMatch[];
  webMatches: OtherSearchMatch[];
  hasOtherMatches: boolean;
  /** Registered artwork id (present for `under_review` external matches). */
  artworkId?: string | null;
};

function toDbMatch(report: SimilarityReport): SearchMatch {
  return {
    type: "database",
    source: report.source ?? "Registered Artwork",
    url: report.matchedArtworkId ?? report.url ?? "",
    link: report.link ?? undefined,
    similarity: report.similarityPercentage ?? 0,
    imageUrl: report.matchedArtworkImageUrl,
    title: report.matchedArtworkTitle,
    authorName: report.matchedArtworkAuthorName,
    registeredAt: report.matchedArtworkRegisteredAt,
    status: report.matchedArtworkStatus,
    licenseName: report.matchedArtworkLicenseName,
    communityUrl: report.matchedArtworkCommunityUrl,
    block_agreements: report.matchedRegions ?? undefined,
    transform_agreements: report.transformVariants ?? undefined,
  };
}

export function SimilarityReportDetailed({
  similarityReport,
  databaseMatches,
  webMatches,
  hasOtherMatches,
  artworkId,
}: SimilarityReportDetailedProps) {
  const isDatabase = similarityReport.type === "database";
  const hasResolvedMetadata =
    !isDatabase ||
    Boolean(
      similarityReport.matchedArtworkTitle ||
        similarityReport.matchedArtworkImageUrl ||
        similarityReport.matchedArtworkAuthorName,
    );
  const matchContext = similarityReportToMatchContext(similarityReport);

  return (
    <div className="space-y-5">
      {isDatabase ? (
        hasResolvedMetadata ? (
          <RegisteredArtworkMatch
            match={toDbMatch(similarityReport)}
            variant="blocked-registration"
          />
        ) : (
          <DegradedBlockedCard report={similarityReport} />
        )
      ) : (
        <WebSourceBlockedCard report={similarityReport} />
      )}

      {/* Action — internal matches are reportable; external ones go to review */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-prose">
            {isDatabase
              ? "Your artwork could not be automatically registered because a potentially similar registered artwork was detected. You can report it for review."
              : "Your artwork was held for manual review because a potentially similar external match was detected. You can request a manual review so a reviewer can investigate."}
          </p>
          <MatchActionButton
            context={matchContext}
            filename={similarityReport.matchedArtworkTitle ?? undefined}
            size="sm"
            artworkId={artworkId}
          />
        </div>
      </div>

      {hasOtherMatches && (
        <div className="space-y-3">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
            <span className="bg-muted-foreground/50 h-1.5 w-1.5 rounded-full" />
            Other matches
          </p>

          <Tabs defaultValue={databaseMatches.length > 0 ? "db" : "web"}>
            <TabsList className="h-8">
              {webMatches.length > 0 && (
                <TabsTrigger value="web" className="gap-1.5 text-xs">
                  <Globe className="h-3 w-3" />
                  Web
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {webMatches.length}
                  </Badge>
                </TabsTrigger>
              )}
              {databaseMatches.length > 0 && (
                <TabsTrigger value="db" className="gap-1.5 text-xs">
                  <Database className="h-3 w-3" />
                  Database
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {databaseMatches.length}
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {databaseMatches.length > 0 && (
              <TabsContent value="db" className="mt-3">
                <ScrollArea className="h-[260px] pr-2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {databaseMatches.map((match, i) => (
                      <MatchThumbnail
                        key={match.url ?? i}
                        imageUrl={match.url}
                        similarity={match.similarity}
                        label="Registered artwork"
                        icon="db"
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            )}

            {webMatches.length > 0 && (
              <TabsContent value="web" className="mt-3">
                <ScrollArea className="h-[260px] pr-2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {webMatches.map((match, i) => (
                      <MatchThumbnail
                        key={match.url ?? i}
                        imageUrl={match.url}
                        similarity={match.similarity}
                        label={match.source}
                        href={match.link}
                        icon="web"
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}

function DegradedBlockedCard({ report }: { report: SimilarityReport }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Registration Blocked
        </CardTitle>
        <CardDescription>
          A registered artwork similarity was detected, but additional artwork
          information is temporarily unavailable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          Similarity{" "}
          <span className="font-semibold">
            {formatSimilarityValue(report.similarityPercentage)}
          </span>
        </p>
        {report.matchedArtworkId && (
          <p className="text-sm break-all">
            Match Reference{" "}
            <span className="font-mono">{report.matchedArtworkId}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Please try viewing the detailed analysis again.
        </p>
      </CardContent>
    </Card>
  );
}

function WebSourceBlockedCard({ report }: { report: SimilarityReport }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Registration Blocked
        </CardTitle>
        <CardDescription>
          A web source with significant visual similarity was found during the
          plagiarism check.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-sky-400" />
          <p className="text-base font-semibold">Web Source Match</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Source</p>
            <p className="text-lg font-semibold">
              {report.source ?? "Unknown"}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Similarity</p>
            <p className="text-lg font-semibold">
              {formatSimilarityValue(report.similarityPercentage)}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-muted-foreground text-sm">Matched URL</p>
            {report.link ? (
              <ReferenceLink href={report.link}>{report.link}</ReferenceLink>
            ) : (
              <p className="text-base">No link available.</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Asset URL</p>
            {report.url ? (
              <ReferenceLink href={report.url}>{report.url}</ReferenceLink>
            ) : (
              <p className="text-base">No image URL available.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

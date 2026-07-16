import Image from "next/image";
import { AlertTriangle, Database, Globe, ImageIcon } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import type { SimilarityReport } from "@/features/(user)/upload-artwork/server/art-similarity-scan";
import type { OtherSearchMatch } from "@/features/plagiarise-checker/types";
import {
  formatSimilarityValue,
  getMatchTypeLabel,
} from "@/features/(user)/upload-artwork/lib/similarity-display";
import { MatchThumbnail } from "@/features/(user)/upload-artwork/components/match-thumbnail";
import { ReferenceLink } from "@/features/(user)/upload-artwork/components/reference-link";

type SimilarityReportDetailedProps = {
  similarityReport: SimilarityReport;
  databaseMatches: OtherSearchMatch[];
  webMatches: OtherSearchMatch[];
  hasOtherMatches: boolean;
};

/**
 * Error-state similarity report: shows the best match plus tabs of all other
 * detected database and web matches.
 */
export function SimilarityReportDetailed({
  similarityReport,
  databaseMatches,
  webMatches,
  hasOtherMatches,
}: SimilarityReportDetailedProps) {
  const similarityValue = formatSimilarityValue(
    similarityReport.similarityPercentage,
  );
  const matchTypeLabel = getMatchTypeLabel(similarityReport.type);
  const matchPreviewUrl = similarityReport.previewImageUrl ?? null;

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Similarity report
        </CardTitle>
        <CardDescription>
          Your artwork was flagged for similarity. Review the best match and all
          other detected matches below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Best match ── */}
        <div className="space-y-3">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Best match
          </p>

          <div className="bg-background overflow-hidden rounded-xl border">
            <div className="grid sm:grid-cols-[auto_1fr]">
              {matchPreviewUrl ? (
                <div className="bg-muted relative h-36 w-full shrink-0 sm:h-auto sm:w-36">
                  <Image
                    src={matchPreviewUrl}
                    alt="Best match preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="bg-muted flex h-36 w-full shrink-0 items-center justify-center sm:h-auto sm:w-36">
                  <ImageIcon className="text-muted-foreground h-8 w-8" />
                </div>
              )}

              <div className="flex flex-col justify-between gap-3 p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                      Similarity
                    </p>
                    <p className="text-xl font-bold text-amber-500">
                      {similarityValue}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                      Type
                    </p>
                    <div className="flex items-center gap-1">
                      {similarityReport.type === "database" ? (
                        <Database className="h-3.5 w-3.5" />
                      ) : (
                        <Globe className="h-3.5 w-3.5" />
                      )}
                      <p className="text-sm font-semibold">{matchTypeLabel}</p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                      Source
                    </p>
                    <p className="text-sm font-semibold">
                      {similarityReport.source ?? "Unknown"}
                    </p>
                  </div>
                </div>

                {similarityReport.type === "internet" && (
                  <div className="space-y-1">
                    {similarityReport.link && (
                      <ReferenceLink
                        href={similarityReport.link}
                        tone="primary"
                        size="xs"
                      >
                        {similarityReport.link}
                      </ReferenceLink>
                    )}
                    {similarityReport.url && (
                      <ReferenceLink
                        href={similarityReport.url}
                        tone="muted"
                        size="xs"
                      >
                        Image source
                      </ReferenceLink>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Other matches ── */}
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
                    <Badge
                      variant="secondary"
                      className="h-4 px-1 text-[10px]"
                    >
                      {webMatches.length}
                    </Badge>
                  </TabsTrigger>
                )}
                {databaseMatches.length > 0 && (
                  <TabsTrigger value="db" className="gap-1.5 text-xs">
                    <Database className="h-3 w-3" />
                    Database
                    <Badge
                      variant="secondary"
                      className="h-4 px-1 text-[10px]"
                    >
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
      </CardContent>
    </Card>
  );
}

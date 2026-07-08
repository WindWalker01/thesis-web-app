"use client";

import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate, cn } from "@/lib/client-utils";
import type { ArtworkDetail } from "../types";

interface SimilarityCardProps {
  scan: ArtworkDetail["scan"];
}

export function SimilarityCard({ scan }: SimilarityCardProps) {
  if (!scan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Similarity Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Search className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No similarity scan available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPending = scan.status === "pending" || scan.status === "running";
  const isCompleted = scan.status === "completed" && scan.success;
  const isFailed = scan.status === "failed" || (!scan.success && scan.status === "completed");
  const similarity = scan.best_similarity_percentage ?? 0;
  const similarityColor = similarity >= 75 ? "bg-red-500" : similarity >= 50 ? "bg-orange-500" : "bg-green-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Similarity Scan</CardTitle>
        {isCompleted && (
          <Badge variant="outline" className="bg-green-100 text-green-600 text-[10px]">
            Completed
          </Badge>
        )}
        {isFailed && (
          <Badge variant="outline" className="bg-red-100 text-red-600 text-[10px]">
            Failed
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isPending ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
            <p className="text-sm text-muted-foreground">Scan in progress...</p>
            {scan.started_at && (
              <p className="text-xs text-muted-foreground">Started {formatDate(scan.started_at)}</p>
            )}
          </div>
        ) : (
          <>
            {/* Best Similarity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Best Similarity</p>
                <span className={cn(
                  "text-sm font-bold",
                  similarity >= 75 ? "text-red-600" : similarity >= 50 ? "text-orange-600" : "text-green-600"
                )}>
                  {similarity}%
                </span>
              </div>
              <Progress value={similarity} className={cn("h-2", similarityColor)} />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Matches</p>
                <p className="font-medium">{scan.total_matches}</p>
              </div>
              {scan.best_source && (
                <div>
                  <p className="text-xs text-muted-foreground">Best Source</p>
                  <p className="font-medium truncate">{scan.best_source}</p>
                </div>
              )}
            </div>

            {scan.best_match_pair && (
              <div>
                <p className="text-xs text-muted-foreground">Best Match</p>
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded block truncate">
                  {scan.best_match_pair}
                </code>
              </div>
            )}

            {scan.completed_at && (
              <p className="text-[10px] text-muted-foreground">
                Scan completed {formatDate(scan.completed_at)}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {scan.best_link && (
                <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" asChild>
                  <a href={scan.best_link} target="_blank" rel="noopener noreferrer">
                    Open Match
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
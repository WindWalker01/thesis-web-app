"use client";

import { AlertTriangle, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MostReportedArtwork } from "../types";

type Props = {
  artworks: MostReportedArtwork[];
};

export function MostReportedArtworks({ artworks }: Props) {
  if (artworks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most Reported</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No reported artworks.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Most Reported</CardTitle>
        <p className="text-muted-foreground text-xs">Artworks with most reports</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {artworks.map((artwork) => (
            <div
              key={artwork.art_post_id}
              className="border-border flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {artwork.thumbnail ? (
                  <img
                    src={artwork.thumbnail}
                    alt={artwork.artwork_title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {artwork.artwork_title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {artwork.report_count} report{artwork.report_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {artwork.top_reason.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {artwork.current_status.replace(/_/g, " ")}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
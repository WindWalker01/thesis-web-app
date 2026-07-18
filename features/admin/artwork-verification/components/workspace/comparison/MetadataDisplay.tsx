"use client";

import { memo } from "react";
import { formatTimeAgo, truncateHash } from "@/lib/client-utils";
import { formatSimilarity } from "./comparison-utils";

interface ArtworkMetadata {
  title: string;
  artistName: string;
  uploadedAt: string;
  hash: string;
  status?: string;
}

interface MetadataDisplayProps {
  original: ArtworkMetadata;
  compared: ArtworkMetadata & { similarity: number | null };
}

export const MetadataDisplay = memo(function MetadataDisplay({
  original,
  compared,
}: MetadataDisplayProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {/* Original Artwork */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Original Artwork
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Title</span>
            <span className="font-medium text-right truncate max-w-[60%]" title={original.title}>
              {original.title}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Artist</span>
            <span className="font-medium text-right truncate max-w-[60%]">
              {original.artistName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Uploaded</span>
            <span className="font-medium text-right text-xs">
              {formatTimeAgo(original.uploadedAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Hash</span>
            <span className="font-mono text-[10px] text-right truncate max-w-[60%]" title={original.hash}>
              {truncateHash(original.hash)}
            </span>
          </div>
          {original.status && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Status</span>
              <span className="font-medium text-right text-xs capitalize">
                {original.status.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Compared Artwork */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Compared Artwork
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Title</span>
            <span className="font-medium text-right truncate max-w-[60%]" title={compared.title}>
              {compared.title}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Artist</span>
            <span className="font-medium text-right truncate max-w-[60%]">
              {compared.artistName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Uploaded</span>
            <span className="font-medium text-right text-xs">
              {formatTimeAgo(compared.uploadedAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Hash</span>
            <span className="font-mono text-[10px] text-right truncate max-w-[60%]" title={compared.hash}>
              {truncateHash(compared.hash)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Similarity</span>
            <span className="font-medium text-right text-xs tabular-nums">
              {formatSimilarity(compared.similarity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
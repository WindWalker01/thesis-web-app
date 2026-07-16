"use client";

import { ImageIcon, SearchX, FileWarning, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/client-utils";

interface EmptyArtworkProps {
  type?: "no_artworks" | "no_results" | "error";
  onReset?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function EmptyArtwork({ type = "no_artworks", onReset, onRetry, className }: EmptyArtworkProps) {
  if (type === "error") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
        <FileWarning className="h-12 w-12 text-destructive mb-3" />
        <h3 className="text-lg font-semibold">Failed to Load Artworks</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          An error occurred while fetching artworks. Please try again.
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4 gap-2" variant="outline">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        )}
      </div>
    );
  }

  if (type === "no_results") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
        <SearchX className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold">No Results Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          No artworks match your current search or filter criteria.
        </p>
        {onReset && (
          <Button onClick={onReset} className="mt-4" variant="outline">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-semibold">No Artworks Yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        There are no registered artworks in the system yet.
      </p>
    </div>
  );
}
"use client";

import { ShieldCheck, Search, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyReviewsProps {
  variant?: "no-results" | "no-pending" | "error" | "loading";
  onClearFilters?: () => void;
  onRetry?: () => void;
}

export function EmptyReviews({ variant = "no-results", onClearFilters, onRetry }: EmptyReviewsProps) {
  if (variant === "no-pending") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">No Pending Reviews</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          All flagged artworks have been reviewed. New submissions requiring
          manual review will appear here automatically.
        </p>
      </div>
    );
  }

  if (variant === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">Failed to Load Reviews</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          An error occurred while fetching the review queue. Please try again.
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Default: no results
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Search className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-semibold">No Reviews Found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        No artwork reviews match your current filter criteria.
      </p>
      {onClearFilters && (
        <Button variant="link" size="sm" className="mt-2" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
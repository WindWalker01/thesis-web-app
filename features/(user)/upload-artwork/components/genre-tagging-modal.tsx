"use client";

import * as React from "react";
import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/client-utils";
import type { GenreScoreLabel } from "@/features/(user)/upload-artwork/types";

// A confirmed selection always has a classifier index — no custom tags.
export type SelectedGenre = {
  id: number;
  label: string;
};

type GenreTaggingModalProps = {
  open: boolean;
  suggestions: GenreScoreLabel[];
  isSubmitting: boolean;
  onSubmit: (selected: SelectedGenre[]) => void;
};

const PRE_SELECT_COUNT = 3;

function getInitialSelected(suggestions: GenreScoreLabel[]): Set<number> {
  // Pre-select the top PRE_SELECT_COUNT genres by rank (API returns results
  // sorted by score descending, so rank = position in the array).
  // Score is intentionally not used as a threshold here — the top entries
  // are pre-selected regardless of their confidence value.
  // TODO: to pre-select by score in the future, replace the slice below with:
  //   suggestions.filter((s) => s.score * 100 >= <threshold>).slice(0, PRE_SELECT_COUNT)
  // where <threshold> is a percentage (e.g. 1 for 1%).
  return new Set(suggestions.slice(0, PRE_SELECT_COUNT).map((s) => s.index));
}

export function GenreTaggingModal({
  open,
  suggestions,
  isSubmitting,
  onSubmit,
}: GenreTaggingModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() =>
    getInitialSelected(suggestions),
  );

  // Re-sync when suggestions change (new upload without unmounting).
  React.useEffect(() => {
    setSelectedIds(getInitialSelected(suggestions));
  }, [suggestions]);

  function toggle(index: number) {
    setSelectedIds((prev) => {
      // Prevent deselecting the last genre.
      if (prev.has(index) && prev.size === 1) return prev;

      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleSubmit() {
    const selected = suggestions
      .filter((s) => selectedIds.has(s.index))
      .map((s) => ({ id: s.index, label: s.label }));

    if (selected.length === 0) return;
    onSubmit(selected);
  }

  const canSubmit = selectedIds.size > 0 && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-background flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-[560px] flex-col overflow-hidden rounded-2xl border p-0 sm:w-[calc(100vw-2rem)]">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-5 text-white sm:px-6">
          <DialogHeader className="space-y-3 text-left">
            <Badge
              variant="secondary"
              className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Genre tagging — required
            </Badge>

            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold text-white">
                Tag your artwork before completing
              </DialogTitle>
              <DialogDescription className="text-base leading-6 text-slate-300">
                Our classifier pre-selected the best matches. Toggle any genre
                to add or remove it — at least one is required.
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Available genres
            </p>
            <p className="text-muted-foreground text-sm">
              {selectedIds.size} selected
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((genre) => {
              const isSelected = selectedIds.has(genre.index);
              const isLast = isSelected && selectedIds.size === 1;

              return (
                <button
                  key={genre.index}
                  type="button"
                  onClick={() => toggle(genre.index)}
                  disabled={isSubmitting}
                  title={
                    isLast
                      ? "At least one genre must remain selected."
                      : undefined
                  }
                  aria-pressed={isSelected}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5",
                    "text-base font-medium transition-all",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    "disabled:pointer-events-none disabled:opacity-50",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50",
                    isLast && "cursor-not-allowed opacity-70",
                  )}
                >
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {genre.label}
                </button>
              );
            })}
          </div>

          {suggestions.length === 0 && (
            <div className="text-muted-foreground flex min-h-[80px] items-center justify-center rounded-xl border border-dashed text-base">
              No genres available from the classifier.
            </div>
          )}

          <p className="text-muted-foreground text-sm">
            The top {PRE_SELECT_COUNT} genres were pre-selected based on
            classifier confidence. You can change the selection freely.
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-muted/20 border-t px-5 py-4 sm:px-6">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              {selectedIds.size === 0
                ? "Select at least one genre to continue."
                : `${selectedIds.size} genre${selectedIds.size === 1 ? "" : "s"} selected.`}
            </p>

            <Button
              type="button"
              className="w-full rounded-xl sm:w-auto"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving tags...
                </>
              ) : (
                "Save & complete registration"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { memo, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComparisonMode } from "./useComparison";

interface FullscreenViewerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  mode: ComparisonMode;
  zoom: number;
}

export const FullscreenViewer = memo(function FullscreenViewer({
  isOpen,
  onClose,
  children,
  mode,
  zoom,
}: FullscreenViewerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when fullscreen is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen comparison viewer"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">
          Artwork Comparison &mdash;{" "}
          <span className="text-muted-foreground font-normal">
            {mode === "slider" ? "Slider Mode" : "Overlay Mode"} &middot; {Math.round(zoom * 100)}% zoom
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <kbd className="hidden sm:inline rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close fullscreen viewer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Full-width comparison content */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black/5">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
});
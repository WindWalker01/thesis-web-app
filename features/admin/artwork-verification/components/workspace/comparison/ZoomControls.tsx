"use client";

import { memo } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/client-utils";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitScreen: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  className?: string;
}

export const ZoomControls = memo(function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitScreen,
  onToggleFullscreen,
  isFullscreen,
  className,
}: ZoomControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background/80 p-1.5 backdrop-blur-sm",
        className
      )}
      role="toolbar"
      aria-label="Image zoom controls"
    >
      {/* Zoom out */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomOut}
        disabled={zoom <= 0.25}
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      {/* Zoom indicator */}
      <span className="min-w-[3rem] text-center text-xs tabular-nums font-medium" aria-live="polite">
        {Math.round(zoom * 100)}%
      </span>

      {/* Zoom in */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomIn}
        disabled={zoom >= 5}
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Reset zoom */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={onReset}
        aria-label="Reset zoom to 100%"
      >
        Reset
      </Button>

      {/* Fit to screen */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={onFitScreen}
        aria-label="Fit image to screen"
      >
        Fit
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Fullscreen toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});
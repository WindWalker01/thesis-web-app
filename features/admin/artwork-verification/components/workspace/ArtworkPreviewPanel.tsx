"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/client-utils";

interface ArtworkPreviewPanelProps {
  c_secure_url: string | null;
  title: string;
}

export function ArtworkPreviewPanel({ c_secure_url, title }: ArtworkPreviewPanelProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(3, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(0.5, prev - 0.25));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
      <div
        className={cn(
          "relative transition-all duration-200",
          isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : "aspect-[4/3]"
        )}
      >
        {c_secure_url ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={c_secure_url}
              alt={title}
              fill
              className="object-contain"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg border bg-background/80 p-1 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs tabular-nums w-8 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
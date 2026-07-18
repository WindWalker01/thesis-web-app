"use client";

import { memo } from "react";
import Image from "next/image";

interface SplitModeProps {
  originalUrl: string;
  comparedUrl: string;
  zoom: number;
  panX: number;
  panY: number;
  onOriginalLoad: () => void;
  onComparedLoad: () => void;
  onOriginalError: () => void;
  onComparedError: () => void;
  originalAlt: string;
  comparedAlt: string;
  originalLabel?: string;
  comparedLabel?: string;
  originalLoaded: boolean;
  comparedLoaded: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPanPointerDown: (e: React.PointerEvent) => void;
}

export const SplitMode = memo(function SplitMode({
  originalUrl,
  comparedUrl,
  zoom,
  panX,
  panY,
  onOriginalLoad,
  onComparedLoad,
  onOriginalError,
  onComparedError,
  originalAlt,
  comparedAlt,
  originalLabel = "Submitted",
  comparedLabel = "Match",
  originalLoaded,
  comparedLoaded,
  containerRef,
  onPanPointerDown,
}: SplitModeProps) {
  const transformStyle = {
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    transformOrigin: "center center",
    willChange: "transform" as const,
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-border bg-muted select-none"
      style={{ aspectRatio: "4/3", touchAction: "none" }}
      onPointerDown={zoom > 1 ? onPanPointerDown : undefined}
    >
      <div className="grid h-full w-full grid-cols-2 gap-0">
        {/* Original artwork */}
        <div className="relative overflow-hidden border-r border-border/50">
          <div className="absolute inset-0" style={transformStyle}>
            <Image
              src={originalUrl}
              alt={originalAlt}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 50vw, 25vw"
              onLoad={onOriginalLoad}
              onError={onOriginalError}
            />
          </div>
          <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white z-10">
            {originalLabel}
          </div>
        </div>

        {/* Compared artwork */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={transformStyle}>
            <Image
              src={comparedUrl}
              alt={comparedAlt}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 50vw, 25vw"
              onLoad={onComparedLoad}
              onError={onComparedError}
            />
          </div>
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white z-10">
            {comparedLabel}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {!originalLoaded && !comparedLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">Loading images...</span>
          </div>
        </div>
      )}
    </div>
  );
});
"use client";

import { memo } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/client-utils";

interface OverlayModeProps {
  originalUrl: string;
  comparedUrl: string;
  overlayOpacity: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onOpacityChange: (opacity: number) => void;
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
  onPanPointerDown: (e: React.PointerEvent) => void;
}

const OPACITY_PRESETS = [0, 25, 50, 75, 100];

export const OverlayMode = memo(function OverlayMode({
  originalUrl,
  comparedUrl,
  overlayOpacity,
  containerRef,
  onOpacityChange,
  zoom,
  panX,
  panY,
  onOriginalLoad,
  onComparedLoad,
  onOriginalError,
  onComparedError,
  originalAlt,
  comparedAlt,
  originalLabel = "Original",
  comparedLabel = "Potential Match",
  originalLoaded,
  comparedLoaded,
  onPanPointerDown,
}: OverlayModeProps) {
  const transformStyle = {
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    transformOrigin: "center center",
    willChange: "transform" as const,
  };

  return (
    <div className="space-y-3">
      {/* Comparison container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-border bg-muted select-none"
        style={{ aspectRatio: "4/3", touchAction: "none" }}
        onPointerDown={zoom > 1 ? onPanPointerDown : undefined}
      >
        {/* Original (bottom layer) */}
        <div className="absolute inset-0" style={transformStyle}>
          <Image
            src={originalUrl}
            alt={originalAlt}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            onLoad={onOriginalLoad}
            onError={onOriginalError}
          />
          <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
            {originalLabel}
          </div>
        </div>

        {/* Compared (top layer, opacity controlled) */}
        <div
          className="absolute inset-0"
          style={{
            ...transformStyle,
            opacity: overlayOpacity / 100,
          }}
        >
          <Image
            src={comparedUrl}
            alt={comparedAlt}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            onLoad={onComparedLoad}
            onError={onComparedError}
          />
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
            {comparedLabel}
          </div>
        </div>

        {/* Loading state */}
        {!originalLoaded && !comparedLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs text-muted-foreground">Loading images...</span>
            </div>
          </div>
        )}
      </div>

      {/* Opacity controls */}
      <div className="space-y-2" role="group" aria-label="Overlay opacity controls">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {comparedLabel} Opacity
            </span>
          </div>
          <span className="text-xs tabular-nums font-medium">
            {overlayOpacity}%
          </span>
        </div>

        {/* Slider input */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={overlayOpacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
          aria-label={`${comparedLabel} opacity`}
          aria-valuenow={overlayOpacity}
          aria-valuemin={0}
          aria-valuemax={100}
        />

        {/* Preset buttons */}
        <div className="flex gap-2">
          {OPACITY_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onOpacityChange(preset)}
              className={cn(
                "flex-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                overlayOpacity === preset
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              aria-label={`Set opacity to ${preset}%`}
              aria-pressed={overlayOpacity === preset}
            >
              {preset === 0 ? (
                <span className="flex items-center justify-center gap-1">
                  <EyeOff className="h-2.5 w-2.5" />
                  Hide
                </span>
              ) : preset === 100 ? (
                <span className="flex items-center justify-center gap-1">
                  <Eye className="h-2.5 w-2.5" />
                  Full
                </span>
              ) : (
                `${preset}%`
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
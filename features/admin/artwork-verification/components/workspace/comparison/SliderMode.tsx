"use client";

import { memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/client-utils";

interface SliderModeProps {
  originalUrl: string;
  comparedUrl: string;
  sliderPosition: number;
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent) => void;
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
}

export const SliderMode = memo(function SliderMode({
  originalUrl,
  comparedUrl,
  sliderPosition,
  isDragging,
  containerRef,
  onPointerDown,
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
}: SliderModeProps) {
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
      role="slider"
      aria-label="Image comparison slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          const newPos = Math.min(100, sliderPosition + 2);
          // Trigger a custom event that the parent can handle
          const event = new CustomEvent("slider-keyboard", {
            detail: { position: newPos },
          });
          document.dispatchEvent(event);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          const newPos = Math.max(0, sliderPosition - 2);
          const event = new CustomEvent("slider-keyboard", {
            detail: { position: newPos },
          });
          document.dispatchEvent(event);
        }
      }}
    >
      {/* Compared image (full width, bottom layer) */}
      <div className="absolute inset-0" style={transformStyle}>
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

      {/* Original image (clipped by slider, top layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          ...transformStyle,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <div className="relative h-full w-full">
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
      </div>

      {/* Percentage indicator */}
      <div
        className={cn(
          "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white tabular-nums transition-opacity",
          isDragging ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        {Math.round(sliderPosition)}% {originalLabel} / {Math.round(100 - sliderPosition)}% {comparedLabel}
      </div>

      {/* Slider handle */}
      <div
        className="absolute inset-y-0 z-10 cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, touchAction: "none" }}
        onPointerDown={onPointerDown}
      >
        {/* Center line */}
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]" />

        {/* Handle circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-white transition-transform hover:scale-110 active:scale-95">
            {/* Chevron left/right indicators */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700"
              aria-hidden="true"
            >
              <path d="M9 4L5 8L9 12" />
              <path d="M11 4L7 8L11 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {!originalLoaded && !comparedLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground">Loading images...</span>
          </div>
        </div>
      )}
    </div>
  );
});
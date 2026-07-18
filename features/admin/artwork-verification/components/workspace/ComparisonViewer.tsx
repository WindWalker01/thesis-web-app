"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { AlertTriangle, RefreshCw, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isValidImageUrl, preloadImage } from "./comparison/comparison-utils";
import { useComparison } from "./comparison/useComparison";
import { SliderMode } from "./comparison/SliderMode";
import { OverlayMode } from "./comparison/OverlayMode";
import { SplitMode } from "./comparison/SplitMode";
import { ZoomControls } from "./comparison/ZoomControls";
import { FullscreenViewer } from "./comparison/FullscreenViewer";
import { MetadataDisplay } from "./comparison/MetadataDisplay";

interface ComparisonViewerProps {
  c_secure_url: string | null;
  best_url: string | null;
  hasScan: boolean;
  /** Optional metadata for the original artwork */
  originalTitle?: string;
  originalArtist?: string;
  originalUploadedAt?: string;
  originalHash?: string;
  originalStatus?: string;
  /** Optional metadata for the compared artwork */
  comparedTitle?: string;
  comparedArtist?: string;
  comparedUploadedAt?: string;
  comparedHash?: string;
  comparedSimilarity?: number | null;
}

export const ComparisonViewer = memo(function ComparisonViewer({
  c_secure_url,
  best_url,
  hasScan,
  originalTitle = "Original Artwork",
  originalArtist = "Unknown",
  originalUploadedAt = new Date().toISOString(),
  originalHash = "",
  originalStatus,
  comparedTitle = "Potential Match",
  comparedArtist = "Unknown",
  comparedUploadedAt = new Date().toISOString(),
  comparedHash = "",
  comparedSimilarity = null,
}: ComparisonViewerProps) {
  const {
    mode,
    setMode,
    sliderPosition,
    setSliderPosition,
    isDragging,
    sliderContainerRef,
    handleSliderPointerDown,
    overlayOpacity,
    setOverlayOpacity,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    panX,
    panY,
    handlePanPointerDown,
    isFullscreen,
    toggleFullscreen,
    exitFullscreen,
    originalLoaded,
    comparedLoaded,
    setOriginalLoaded,
    setComparedLoaded,
    hasError,
    setHasError,
  } = useComparison();

  const originalUrl = isValidImageUrl(c_secure_url) ? c_secure_url! : null;
  const comparedUrl = isValidImageUrl(best_url) ? best_url! : null;
  const canCompare = originalUrl !== null && comparedUrl !== null;

  // Preload images when they become available
  const preloadedRef = useRef(false);
  useEffect(() => {
    if (!canCompare || preloadedRef.current) return;
    preloadedRef.current = true;
    Promise.all([
      preloadImage(originalUrl!).catch(() => {}),
      preloadImage(comparedUrl!).catch(() => {}),
    ]);
  }, [canCompare, originalUrl, comparedUrl]);

  // Handle keyboard events for slider
  useEffect(() => {
    const handleKeyboard = (e: CustomEvent) => {
      if (e.detail?.position !== undefined) {
        setSliderPosition(e.detail.position);
      }
    };
    document.addEventListener("slider-keyboard", handleKeyboard as EventListener);
    return () => document.removeEventListener("slider-keyboard", handleKeyboard as EventListener);
  }, [setSliderPosition]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setOriginalLoaded(false);
    setComparedLoaded(false);
    preloadedRef.current = false;
  }, [setHasError]);

  // Error state
  if (hasError) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Side-by-side Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm font-medium">Unable to load artwork</p>
            <p className="text-xs text-muted-foreground mt-1">
              One or both images could not be loaded.
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={handleRetry}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No scan data state
  if (!hasScan || !canCompare) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Side-by-side Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {!hasScan
                ? "No similarity scan data available"
                : "No matched artwork to compare"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {!hasScan
                ? "A similarity scan must be completed before comparison is available."
                : "The scan did not find any matching artwork to compare against."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonContent = (
    <div className="space-y-3">
      {/* Mode tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "split" | "slider" | "overlay")}
        className="w-full"
      >
        <div className="flex items-center justify-between">
          <TabsList className="h-8">
            <TabsTrigger value="split" className="text-xs">
              Split View
            </TabsTrigger>
            <TabsTrigger value="slider" className="text-xs">
              Slider
            </TabsTrigger>
            <TabsTrigger value="overlay" className="text-xs">
              Overlay
            </TabsTrigger>
          </TabsList>

          {/* Zoom controls */}
          <ZoomControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
            onFitScreen={fitToScreen}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
        </div>

        {/* Split View mode */}
        <TabsContent value="split" className="mt-3">
          <SplitMode
            originalUrl={originalUrl!}
            comparedUrl={comparedUrl!}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onOriginalLoad={() => setOriginalLoaded(true)}
            onComparedLoad={() => setComparedLoaded(true)}
            onOriginalError={() => setHasError(true)}
            onComparedError={() => setHasError(true)}
            originalAlt={originalTitle}
            comparedAlt={comparedTitle}
            originalLoaded={originalLoaded}
            comparedLoaded={comparedLoaded}
            containerRef={sliderContainerRef}
            onPanPointerDown={handlePanPointerDown}
          />
        </TabsContent>

        {/* Slider mode */}
        <TabsContent value="slider" className="mt-3">
          <SliderMode
            originalUrl={originalUrl!}
            comparedUrl={comparedUrl!}
            sliderPosition={sliderPosition}
            isDragging={isDragging}
            containerRef={sliderContainerRef}
            onPointerDown={handleSliderPointerDown}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onOriginalLoad={() => setOriginalLoaded(true)}
            onComparedLoad={() => setComparedLoaded(true)}
            onOriginalError={() => setHasError(true)}
            onComparedError={() => setHasError(true)}
            originalAlt={originalTitle}
            comparedAlt={comparedTitle}
            originalLoaded={originalLoaded}
            comparedLoaded={comparedLoaded}
          />
        </TabsContent>

        {/* Overlay mode */}
        <TabsContent value="overlay" className="mt-3">
          <OverlayMode
            originalUrl={originalUrl!}
            comparedUrl={comparedUrl!}
            overlayOpacity={overlayOpacity}
            containerRef={sliderContainerRef}
            onOpacityChange={setOverlayOpacity}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onOriginalLoad={() => setOriginalLoaded(true)}
            onComparedLoad={() => setComparedLoaded(true)}
            onOriginalError={() => setHasError(true)}
            onComparedError={() => setHasError(true)}
            originalAlt={originalTitle}
            comparedAlt={comparedTitle}
            originalLoaded={originalLoaded}
            comparedLoaded={comparedLoaded}
            onPanPointerDown={handlePanPointerDown}
          />
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <MetadataDisplay
        original={{
          title: originalTitle,
          artistName: originalArtist,
          uploadedAt: originalUploadedAt,
          hash: originalHash,
          status: originalStatus,
        }}
        compared={{
          title: comparedTitle,
          artistName: comparedArtist,
          uploadedAt: comparedUploadedAt,
          hash: comparedHash,
          similarity: comparedSimilarity,
        }}
      />
    </div>
  );

  return (
    <>
      {/* Inline comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Side-by-side Comparison</CardTitle>
        </CardHeader>
        <CardContent>{comparisonContent}</CardContent>
      </Card>

      {/* Fullscreen overlay */}
      <FullscreenViewer
        isOpen={isFullscreen}
        onClose={exitFullscreen}
        mode={mode}
        zoom={zoom}
      >
        {comparisonContent}
      </FullscreenViewer>
    </>
  );
});
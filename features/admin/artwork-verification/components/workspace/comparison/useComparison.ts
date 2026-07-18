"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { clamp } from "./comparison-utils";

export type ComparisonMode = "split" | "slider" | "overlay";

interface UseComparisonOptions {
  /** Initial zoom level (1 = 100%) */
  initialZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Zoom step increment */
  zoomStep?: number;
}

interface UseComparisonReturn {
  // Mode
  mode: ComparisonMode;
  setMode: (mode: ComparisonMode) => void;

  // Slider
  sliderPosition: number; // 0-100 percentage
  setSliderPosition: (pos: number) => void;
  isDragging: boolean;
  sliderContainerRef: React.RefObject<HTMLDivElement | null>;
  handleSliderPointerDown: (e: React.PointerEvent) => void;

  // Overlay
  overlayOpacity: number; // 0-100 percentage
  setOverlayOpacity: (opacity: number) => void;

  // Zoom
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;

  // Pan
  panX: number;
  panY: number;
  isPanning: boolean;
  handlePanPointerDown: (e: React.PointerEvent) => void;

  // Fullscreen
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;

  // Image loading
  originalLoaded: boolean;
  comparedLoaded: boolean;
  setOriginalLoaded: (loaded: boolean) => void;
  setComparedLoaded: (loaded: boolean) => void;
  hasError: boolean;
  setHasError: (error: boolean) => void;
}

export function useComparison(
  options: UseComparisonOptions = {}
): UseComparisonReturn {
  const {
    initialZoom = 1,
    minZoom = 0.25,
    maxZoom = 5,
    zoomStep = 0.25,
  } = options;

  // Mode
  const [mode, setMode] = useState<ComparisonMode>("slider");

  // Slider
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  // Overlay
  const [overlayOpacity, setOverlayOpacity] = useState(50);

  // Zoom
  const [zoom, setZoomState] = useState(initialZoom);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Image loading
  const [originalLoaded, setOriginalLoaded] = useState(false);
  const [comparedLoaded, setComparedLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Pan tracking refs
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset = useRef({ x: 0, y: 0 });

  // Slider pointer handler
  const handleSliderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = clamp((x / rect.width) * 100, 0, 100);
      setSliderPosition(percentage);
      setIsDragging(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!sliderContainerRef.current) return;
        const moveRect = sliderContainerRef.current.getBoundingClientRect();
        const moveX = moveEvent.clientX - moveRect.left;
        const movePercentage = clamp((moveX / moveRect.width) * 100, 0, 100);
        setSliderPosition(movePercentage);
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    []
  );

  // Pan pointer handler
  const handlePanPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return; // Only pan when zoomed in
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      panOffset.current = { x: panX, y: panY };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - panStart.current.x;
        const dy = moveEvent.clientY - panStart.current.y;
        setPanX(panOffset.current.x + dx);
        setPanY(panOffset.current.y + dy);
      };

      const handlePointerUp = () => {
        setIsPanning(false);
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [zoom, panX, panY]
  );

  // Zoom controls
  const setZoom = useCallback(
    (newZoom: number) => {
      setZoomState(clamp(newZoom, minZoom, maxZoom));
    },
    [minZoom, maxZoom]
  );

  const zoomIn = useCallback(() => {
    setZoomState((prev) => clamp(prev + zoomStep, minZoom, maxZoom));
  }, [zoomStep, minZoom, maxZoom]);

  const zoomOut = useCallback(() => {
    setZoomState((prev) => clamp(prev - zoomStep, minZoom, maxZoom));
  }, [zoomStep, minZoom, maxZoom]);

  const resetZoom = useCallback(() => {
    setZoomState(initialZoom);
    setPanX(0);
    setPanY(0);
  }, [initialZoom]);

  const fitToScreen = useCallback(() => {
    setZoomState(1);
    setPanX(0);
    setPanY(0);
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // ESC key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Mouse wheel zoom
  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      setZoomState((prev) => clamp(prev + delta, minZoom, maxZoom));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoomStep, minZoom, maxZoom]);

  return {
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
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    panX,
    panY,
    isPanning,
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
  };
}
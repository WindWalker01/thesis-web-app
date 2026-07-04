"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/client-utils";
import { EmptyReports } from "./EmptyReports";
import type { ReportEvidence } from "@/features/reports/types";

interface EvidenceViewerProps {
  evidence: ReportEvidence[];
  isLoading?: boolean;
}

export function EvidenceViewer({ evidence, isLoading }: EvidenceViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const current = evidence[currentIndex];
  const isImage = current?.mime_type?.startsWith("image/");

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
    setZoom(1);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
    setZoom(1);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (evidence.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyReports variant="no-evidence" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm">
          Evidence ({evidence.length})
        </CardTitle>
        {evidence.length > 1 && (
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} of {evidence.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Viewer */}
        <div
          className={cn(
            "relative overflow-hidden rounded-lg bg-muted",
            isFullscreen ? "fixed inset-0 z-50 flex items-center justify-center bg-black/90" : "aspect-video"
          )}
        >
          {isImage ? (
            <div
              className="flex h-full w-full items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <Image
                src={current.file_url}
                alt={current.file_name}
                fill
                className="object-contain"
                sizes={isFullscreen ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
              />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <FileText className="h-12 w-12 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">{current.file_name}</p>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-background/80 p-1 backdrop-blur-sm">
            {evidence.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="h-4 w-px bg-border" />
              </>
            )}
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <div className="h-4 w-px bg-border" />
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <a
              href={current.file_url}
              download={current.file_name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Thumbnails */}
        {evidence.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {evidence.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                }}
                className={cn(
                  "relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                  idx === currentIndex
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                {item.mime_type?.startsWith("image/") ? (
                  <Image
                    src={item.file_url}
                    alt={item.file_name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* File info */}
        <div className="space-y-1">
          <p className="text-sm font-medium truncate">{current.file_name}</p>
          {current.description && (
            <p className="text-xs text-muted-foreground">{current.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
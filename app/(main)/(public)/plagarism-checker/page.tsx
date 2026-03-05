"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Download,
  AlertTriangle,
  Globe,
  ArrowLeftRight,
} from "lucide-react";

import {
  type Stage,
  type Mode,
  ModeToggle,
  AnalyzingScreen,
  WebModeUpload,
  WebModeResult,
  CompareModeUpload,
  CompareModeResult,
} from "@/features/plagiarise-checker";

export default function PlagiarismCheckerPage() {
  const [mode, setMode] = useState<Mode>("web");
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);

  const [webPreview, setWebPreview] = useState<string | null>(null);
  const [comparePreviewA, setComparePreviewA] = useState<string | null>(null);
  const [comparePreviewB, setComparePreviewB] = useState<string | null>(null);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      if (webPreview) URL.revokeObjectURL(webPreview);
      if (comparePreviewA) URL.revokeObjectURL(comparePreviewA);
      if (comparePreviewB) URL.revokeObjectURL(comparePreviewB);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runAnalysis = () => {
    setStage("analyzing");
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStage("result"), 400);
      }
      setProgress(Math.min(Math.floor(p), 100));
    }, 180);
  };

  const handleWebUpload = (file: File) => {
    if (webPreview) URL.revokeObjectURL(webPreview);
    setWebPreview(URL.createObjectURL(file));
    runAnalysis();
  };

  const handleCompareUploadA = (file: File) => {
    if (comparePreviewA) URL.revokeObjectURL(comparePreviewA);
    setComparePreviewA(URL.createObjectURL(file));
  };

  const handleCompareUploadB = (file: File) => {
    if (comparePreviewB) URL.revokeObjectURL(comparePreviewB);
    setComparePreviewB(URL.createObjectURL(file));
  };

  const handleClearA = () => {
    if (comparePreviewA) {
      URL.revokeObjectURL(comparePreviewA);
      setComparePreviewA(null);
    }
  };

  const handleClearB = () => {
    if (comparePreviewB) {
      URL.revokeObjectURL(comparePreviewB);
      setComparePreviewB(null);
    }
  };

  const handleReset = () => {
    setStage("upload");
    setProgress(0);
    if (webPreview) {
      URL.revokeObjectURL(webPreview);
      setWebPreview(null);
    }
    if (comparePreviewA) {
      URL.revokeObjectURL(comparePreviewA);
      setComparePreviewA(null);
    }
    if (comparePreviewB) {
      URL.revokeObjectURL(comparePreviewB);
      setComparePreviewB(null);
    }
  };

  const handleModeChange = (m: Mode) => {
    handleReset();
    setMode(m);
  };

  return (
    <main className="bg-background min-h-screen">
      {/* ── Header ── */}
      <div className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Dashboard</span>
              <span className="text-muted-foreground/40 text-xs">›</span>
              <span className="text-primary text-xs font-medium">
                Plagiarism Analysis
              </span>
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Plagiarism Detection Analysis
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Perceptual hash comparison using pHash algorithm v4.2
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw size={13} /> New Analysis
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download size={13} /> Export PDF
            </Button>
            {stage === "result" && (
              <Button variant="destructive" size="sm" className="gap-1.5">
                <AlertTriangle size={13} /> Flag for Review
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Mode toggle */}
        <div className="flex items-center justify-between">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {mode === "web" ? (
              <>
                <Globe size={12} /> Scans millions of web records
              </>
            ) : (
              <>
                <ArrowLeftRight size={12} /> Direct image-to-image comparison
              </>
            )}
          </p>
        </div>

        {/* ── Web Search Mode ── */}
        {mode === "web" && (
          <>
            {stage === "upload" && <WebModeUpload onUpload={handleWebUpload} />}
            {stage === "analyzing" && (
              <AnalyzingScreen progress={progress} mode="web" />
            )}
            {stage === "result" && webPreview && (
              <WebModeResult preview={webPreview} />
            )}
          </>
        )}

        {/* ── Compare Two Images Mode ── */}
        {mode === "compare" && (
          <>
            {stage === "upload" && (
              <CompareModeUpload
                previewA={comparePreviewA}
                previewB={comparePreviewB}
                onUploadA={handleCompareUploadA}
                onUploadB={handleCompareUploadB}
                onClearA={handleClearA}
                onClearB={handleClearB}
                onCompare={runAnalysis}
              />
            )}
            {stage === "analyzing" && (
              <AnalyzingScreen progress={progress} mode="compare" />
            )}
            {stage === "result" && comparePreviewA && comparePreviewB && (
              <CompareModeResult
                previewA={comparePreviewA}
                previewB={comparePreviewB}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

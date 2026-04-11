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
  ModeToggle,
  AnalyzingScreen,
  WebModeUpload,
  WebModeResult,
  CompareModeUpload,
  CompareModeResult,
} from "@/features/plagiarise-checker";

import {
  type Stage,
  type Mode,
  type CompareResponse,
  type SearchResponse,
} from "@/features/plagiarise-checker";

const API_BASE =
  process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL ?? "http://localhost:8000";

export default function PlagiarismCheckerPage() {
  const [mode, setMode] = useState<Mode>("web");
  const [stage, setStage] = useState<Stage>("upload");
  const [error, setError] = useState<string | null>(null);

  // Web mode state
  const [webFile, setWebFile] = useState<File | null>(null);
  const [webPreview, setWebPreview] = useState<string | null>(null);
  const [webResult, setWebResult] = useState<SearchResponse | null>(null);

  // Compare mode state
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(
    null,
  );

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      if (webPreview) URL.revokeObjectURL(webPreview);
      if (previewA) URL.revokeObjectURL(previewA);
      if (previewB) URL.revokeObjectURL(previewB);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers: Web mode ─────────────────────────────────────────────────────

  const handleWebUpload = async (file: File) => {
    if (webPreview) URL.revokeObjectURL(webPreview);
    setWebFile(file);
    setWebPreview(URL.createObjectURL(file));
    setWebResult(null);
    setError(null);
    setStage("analyzing");

    try {
      const form = new FormData();
      // Backend param name: file
      form.append("file", file);

      const res = await fetch(`${API_BASE}/plagiarism/check/web`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Server error: ${res.status}`);
      }

      const data: SearchResponse = await res.json();
      setWebResult(data);
      setStage("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      setStage("error");
    }
  };

  // ── Handlers: Compare mode ─────────────────────────────────────────────────

  const handleCompareUploadA = (file: File) => {
    if (previewA) URL.revokeObjectURL(previewA);
    setFileA(file);
    setPreviewA(URL.createObjectURL(file));
  };

  const handleCompareUploadB = (file: File) => {
    if (previewB) URL.revokeObjectURL(previewB);
    setFileB(file);
    setPreviewB(URL.createObjectURL(file));
  };

  const handleClearA = () => {
    if (previewA) URL.revokeObjectURL(previewA);
    setFileA(null);
    setPreviewA(null);
  };

  const handleClearB = () => {
    if (previewB) URL.revokeObjectURL(previewB);
    setFileB(null);
    setPreviewB(null);
  };

  const handleCompare = async () => {
    if (!fileA || !fileB) return;
    setCompareResult(null);
    setError(null);
    setStage("analyzing");

    try {
      const form = new FormData();
      // Backend param names: file1, file2
      form.append("file1", fileA);
      form.append("file2", fileB);

      const res = await fetch(`${API_BASE}/plagiarism/compare`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Server error: ${res.status}`);
      }

      const data: CompareResponse = await res.json();
      setCompareResult(data);
      setStage("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      setStage("error");
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setStage("upload");
    setError(null);
    setWebResult(null);
    setCompareResult(null);
    if (webPreview) {
      URL.revokeObjectURL(webPreview);
      setWebPreview(null);
      setWebFile(null);
    }
    if (previewA) {
      URL.revokeObjectURL(previewA);
      setPreviewA(null);
      setFileA(null);
    }
    if (previewB) {
      URL.revokeObjectURL(previewB);
      setPreviewB(null);
      setFileB(null);
    }
  };

  const handleModeChange = (m: Mode) => {
    handleReset();
    setMode(m);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

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
                <Globe size={12} /> Checks registered DB + web sources
              </>
            ) : (
              <>
                <ArrowLeftRight size={12} /> Direct image-to-image comparison
              </>
            )}
          </p>
        </div>

        {/* ── Error state ── */}
        {stage === "error" && (
          <div className="bg-destructive/10 border-destructive/30 flex items-start gap-4 rounded-2xl border p-6">
            <AlertTriangle
              size={20}
              className="text-destructive mt-0.5 shrink-0"
            />
            <div>
              <p className="text-foreground font-semibold">Analysis Failed</p>
              <p className="text-muted-foreground mt-1 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5"
                onClick={handleReset}
              >
                <RotateCcw size={12} /> Try Again
              </Button>
            </div>
          </div>
        )}

        {/* ── Web Search Mode ── */}
        {mode === "web" && stage !== "error" && (
          <>
            {stage === "upload" && <WebModeUpload onUpload={handleWebUpload} />}
            {stage === "analyzing" && (
              <AnalyzingScreen progress={0} mode="web" indeterminate />
            )}
            {stage === "result" && webPreview && webResult && (
              <WebModeResult preview={webPreview} result={webResult} />
            )}
          </>
        )}

        {/* ── Compare Two Images Mode ── */}
        {mode === "compare" && stage !== "error" && (
          <>
            {stage === "upload" && (
              <CompareModeUpload
                fileA={fileA}
                fileB={fileB}
                previewA={previewA}
                previewB={previewB}
                onUploadA={handleCompareUploadA}
                onUploadB={handleCompareUploadB}
                onClearA={handleClearA}
                onClearB={handleClearB}
                onCompare={handleCompare}
              />
            )}
            {stage === "analyzing" && (
              <AnalyzingScreen progress={0} mode="compare" indeterminate />
            )}
            {stage === "result" && compareResult && previewA && previewB && (
              <CompareModeResult
                previewA={previewA}
                filenameA={fileA?.name ?? compareResult.image1}
                previewB={previewB}
                filenameB={fileB?.name ?? compareResult.image2}
                result={compareResult}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

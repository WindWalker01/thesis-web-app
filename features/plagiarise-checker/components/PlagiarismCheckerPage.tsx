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

import { resolveDbArtworkById } from "../server/resolve-db-artwork";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import { generatePlagiarismReportPdf } from "@/features/plagiarise-checker/lib/plagiarism-report";

const API_BASE =
  process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL ?? "http://localhost:8000";

export default function PlagiarismCheckerPage() {
  const [mode, setMode] = useState<Mode>("web");
  const [stage, setStage] = useState<Stage>("upload");
  const [error, setError] = useState<string | null>(null);
  const [errorTime, setErrorTime] = useState<Date | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [copyConfirmed, setCopyConfirmed] = useState(false);

  // Web mode state
  const [webFile, setWebFile] = useState<File | null>(null);
  const [webPreview, setWebPreview] = useState<string | null>(null);
  const [webResult, setWebResult] = useState<SearchResponse | null>(null);

  // Compare mode state
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);

  const { isAuthenticated } = useAuth();

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
    setErrorTime(null);
    setStage("analyzing");

    try {
      const form = new FormData();
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

      // ── Enrich DB match: resolve UUID → Cloudinary imageUrl + title ──
      if (data.db?.type === "database" && data.db.url) {
        const resolved = await resolveDbArtworkById(data.db.url);
        if (resolved) {
          data.db = { ...data.db, imageUrl: resolved.imageUrl, title: resolved.title };
          if (data.best_match?.type === "database") {
            data.best_match = { ...data.best_match, imageUrl: resolved.imageUrl, title: resolved.title };
          }
        }
      }

      setWebResult(data);
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setErrorTime(new Date());
      setStage("error");
    }
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────

  const handleExportPdf = async () => {
    if (!webResult) return;
    setExportingPdf(true);
    try {
      await generatePlagiarismReportPdf({
        result: webResult,
        submittedImagePreview: webPreview ?? undefined,
        checkedAt: new Date(),
      });
    } finally {
      setExportingPdf(false);
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
    setErrorTime(null);
    setStage("analyzing");

    try {
      const form = new FormData();
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
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setErrorTime(new Date());
      setStage("error");
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setStage("upload");
    setError(null);
    setErrorTime(null);
    setCompareResult(null);
    setWebResult(null);
    if (webPreview) { URL.revokeObjectURL(webPreview); setWebPreview(null); setWebFile(null); }
    if (previewA) { URL.revokeObjectURL(previewA); setPreviewA(null); setFileA(null); }
    if (previewB) { URL.revokeObjectURL(previewB); setPreviewB(null); setFileB(null); }
  };

  const handleModeChange = (m: Mode) => {
    handleReset();
    setMode(m);
  };

  const handleCopyErrorReport = async () => {
    const report = [
      `Plagiarism Detection — Error Report`,
      `────────────────────────────────────`,
      `Mode:      ${mode === "web" ? "Web Search" : "Direct Comparison"}`,
      `Time:      ${errorTime?.toISOString() ?? new Date().toISOString()}`,
      `Status:    Analysis failed — pending manual review`,
      ``,
      `Error Detail:`,
      error ?? "Unknown error",
    ].join("\n");

    await navigator.clipboard.writeText(report);
    setCopyConfirmed(true);
    setTimeout(() => setCopyConfirmed(false), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="bg-background min-h-screen">
      {/* ── Header ── */}
      <div className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Dashboard</span>
              <span className="text-muted-foreground/40 text-sm">›</span>
              <span className="text-primary text-sm font-medium">Plagiarism Analysis</span>
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Plagiarism Detection Analysis
            </h1>
            <p className="text-muted-foreground mt-0.5 text-base">
              Perceptual hash comparison using pHash algorithm v4.2
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw size={13} /> New Analysis
            </Button>

            {/* Export PDF — only shown when web mode has results */}
            {stage === "result" && mode === "web" && webResult && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleExportPdf}
                disabled={exportingPdf}
              >
                <Download size={13} />
                {exportingPdf ? "Generating..." : "Export PDF"}
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
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            {mode === "web" ? (
              <><Globe size={12} /> Checks registered DB + web sources</>
            ) : (
              <><ArrowLeftRight size={12} /> Direct image-to-image comparison</>
            )}
          </p>
        </div>

        {/* ── Error state ── */}
        {stage === "error" && (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20 overflow-hidden">

            {/* Status banner */}
            <div className="flex items-center gap-3 border-b border-amber-200/70 dark:border-amber-800/40 bg-amber-100/70 dark:bg-amber-900/30 px-6 py-3">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-widest">
                Action Required — Submission Under Review
              </span>
              {errorTime && (
                <span className="ml-auto text-amber-700/60 dark:text-amber-500/60 text-xs tabular-nums">
                  {errorTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
            </div>

            {/* Main content */}
            <div className="px-6 py-6 flex items-start gap-5">
              <div className="flex-shrink-0 mt-0.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 p-3">
                <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400" />
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                {/* Heading + summary */}
                <div>
                  <p className="text-foreground text-base font-semibold leading-snug">
                    Analysis Could Not Be Completed
                  </p>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed max-w-prose">
                    The plagiarism detection process encountered an issue and was unable to produce
                    a result. This submission has been automatically flagged and queued for manual
                    review. No further action is required on your part unless you choose to
                    resubmit.
                  </p>
                </div>

                {/* What this means */}
                <div className="rounded-lg border border-amber-200/80 dark:border-amber-800/50 bg-white/50 dark:bg-black/20 divide-y divide-amber-100 dark:divide-amber-900/50">
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      What this means
                    </p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        The analysis pipeline did not return a valid response from the server.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        Your submission has been logged and will be reviewed by the moderation team.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        Resubmitting the same file is safe and will not create duplicate entries.
                      </li>
                    </ul>
                  </div>

                  {/* Technical detail */}
                  {error && (
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Error Detail
                      </p>
                      <p className="font-mono text-xs text-foreground/70 leading-relaxed break-all">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground/60">Mode</span>{" "}
                      {mode === "web" ? "Web Search" : "Direct Comparison"}
                    </span>
                    <span>
                      <span className="font-medium text-foreground/60">Algorithm</span>{" "}
                      pHash v4.2
                    </span>
                    <span>
                      <span className="font-medium text-foreground/60">Review Status</span>{" "}
                      Queued for Manual Review
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={handleReset}>
                    <RotateCcw size={12} />
                    Resubmit Analysis
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground gap-1.5"
                    onClick={handleCopyErrorReport}
                  >
                    {copyConfirmed ? "Copied!" : "Copy Error Report"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Web Search Mode ── */}
        {mode === "web" && stage !== "error" && (
          <>
            {stage === "upload" && <WebModeUpload onUpload={handleWebUpload} />}
            {stage === "analyzing" && <AnalyzingScreen progress={0} mode="web" indeterminate />}
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
            {stage === "analyzing" && <AnalyzingScreen progress={0} mode="compare" indeterminate />}
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
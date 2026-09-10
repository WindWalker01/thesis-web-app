"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/client-utils";
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

import { usePlagiarismChecker } from "@/features/plagiarise-checker/hooks/use-plagiarism-checker";

export default function PlagiarismCheckerPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const {
    mode,
    stage,
    error,
    errorTime,
    exportingPdf,
    copyConfirmed,
    webFile,
    webPreview,
    webResult,
    fileA,
    fileB,
    previewA,
    previewB,
    compareResult,
    handleWebUpload,
    handleExportPdf,
    handleCompareUploadA,
    handleCompareUploadB,
    handleClearA,
    handleClearB,
    handleCompare,
    handleReset,
    handleModeChange,
    handleCopyErrorReport,
  } = usePlagiarismChecker();

  return (
    <main className="bg-background min-h-screen">
      {/* ── Header ── */}
      <div
        className={cn(
          "border-border bg-background/95 sticky z-10 border-b backdrop-blur transition-[top] duration-200",
          isScrolled ? "top-15" : "top-3",
        )}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 hidden items-center gap-2 sm:flex">
              <span className="text-muted-foreground text-sm">Dashboard</span>
              <span className="text-muted-foreground/40 text-sm">›</span>
              <span className="text-primary text-sm font-medium">
                Plagiarism Analysis
              </span>
            </div>
            <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              Plagiarism Detection Analysis
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm sm:text-base">
              Perceptual hash comparison using pHash algorithm v4.2
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
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
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Mode toggle */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs sm:text-sm">
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
          <div className="overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20">
            {/* Status banner */}
            <div className="flex flex-wrap items-center gap-2 border-b border-amber-200/70 bg-amber-100/70 px-4 py-3 sm:px-6 dark:border-amber-800/40 dark:bg-amber-900/30">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="text-xs font-semibold tracking-widest text-amber-800 uppercase dark:text-amber-300">
                Action Required — Submission Under Review
              </span>
              {errorTime && (
                <span className="ml-auto text-xs text-amber-700/60 tabular-nums dark:text-amber-500/60">
                  {errorTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              )}
            </div>

            {/* Main content */}
            <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-5 sm:px-6 sm:py-6">
              <div className="mt-0.5 w-fit flex-shrink-0 rounded-xl bg-amber-100 p-3 dark:bg-amber-900/50">
                <AlertTriangle
                  size={22}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                {/* Heading + summary */}
                <div>
                  <p className="text-foreground text-base leading-snug font-semibold">
                    Analysis Could Not Be Completed
                  </p>
                  <p className="text-muted-foreground mt-1.5 max-w-prose text-sm leading-relaxed">
                    The plagiarism detection process encountered an issue and
                    was unable to produce a result. This submission has been
                    automatically flagged and queued for manual review. No
                    further action is required on your part unless you choose to
                    resubmit.
                  </p>
                </div>

                {/* What this means */}
                <div className="divide-y divide-amber-100 rounded-lg border border-amber-200/80 bg-white/50 dark:divide-amber-900/50 dark:border-amber-800/50 dark:bg-black/20">
                  <div className="px-4 py-3">
                    <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      What this means
                    </p>
                    <ul className="text-muted-foreground space-y-1.5 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                        The analysis pipeline did not return a valid response
                        from the server.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                        Your submission has been logged and will be reviewed by
                        the moderation team.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                        Resubmitting the same file is safe and will not create
                        duplicate entries.
                      </li>
                    </ul>
                  </div>

                  {/* Technical detail */}
                  {error && (
                    <div className="px-4 py-3">
                      <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                        Error Detail
                      </p>
                      <p className="text-foreground/70 font-mono text-xs leading-relaxed break-all">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 text-xs">
                    <span>
                      <span className="text-foreground/60 font-medium">
                        Mode
                      </span>{" "}
                      {mode === "web" ? "Web Search" : "Direct Comparison"}
                    </span>
                    <span>
                      <span className="text-foreground/60 font-medium">
                        Algorithm
                      </span>{" "}
                      pHash v4.2
                    </span>
                    <span>
                      <span className="text-foreground/60 font-medium">
                        Review Status
                      </span>{" "}
                      Queued for Manual Review
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleReset}
                  >
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
            {stage === "analyzing" && (
              <AnalyzingScreen progress={0} mode="web" indeterminate />
            )}
            {stage === "result" && webPreview && webResult && (
              <WebModeResult
                preview={webPreview}
                result={webResult}
                onRetry={
                  webFile ? () => handleWebUpload(webFile) : undefined
                }
              />
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

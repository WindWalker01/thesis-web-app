"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Stage,
  Mode,
  CompareResponse,
  SearchResponse,
} from "@/features/plagiarise-checker/types";
import { checkPlagiarismWeb } from "@/features/plagiarise-checker/server/check-plagiarism-web";
import { checkPlagiarismCompare } from "@/features/plagiarise-checker/server/check-plagiarism-compare";
import { generatePlagiarismReportPdf } from "@/features/plagiarise-checker/lib/plagiarism-report";

export function usePlagiarismChecker() {
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

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      if (webPreview) URL.revokeObjectURL(webPreview);
      if (previewA) URL.revokeObjectURL(previewA);
      if (previewB) URL.revokeObjectURL(previewB);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers: Web mode ─────────────────────────────────────────────────────

  const handleWebUpload = useCallback(async (file: File) => {
    if (webPreview) URL.revokeObjectURL(webPreview);
    setWebFile(file);
    setWebPreview(URL.createObjectURL(file));
    setWebResult(null);
    setError(null);
    setErrorTime(null);
    setStage("analyzing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await checkPlagiarismWeb(null, formData);

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "An unexpected error occurred.");
      }

      setWebResult(result.data);
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setErrorTime(new Date());
      setStage("error");
    }
  }, [webPreview]);

  // ── Export PDF ─────────────────────────────────────────────────────────────

  const handleExportPdf = useCallback(async () => {
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
  }, [webResult, webPreview]);

  // ── Handlers: Compare mode ─────────────────────────────────────────────────

  const handleCompareUploadA = useCallback((file: File) => {
    if (previewA) URL.revokeObjectURL(previewA);
    setFileA(file);
    setPreviewA(URL.createObjectURL(file));
  }, [previewA]);

  const handleCompareUploadB = useCallback((file: File) => {
    if (previewB) URL.revokeObjectURL(previewB);
    setFileB(file);
    setPreviewB(URL.createObjectURL(file));
  }, [previewB]);

  const handleClearA = useCallback(() => {
    if (previewA) URL.revokeObjectURL(previewA);
    setFileA(null);
    setPreviewA(null);
  }, [previewA]);

  const handleClearB = useCallback(() => {
    if (previewB) URL.revokeObjectURL(previewB);
    setFileB(null);
    setPreviewB(null);
  }, [previewB]);

  const handleCompare = useCallback(async () => {
    if (!fileA || !fileB) return;
    setCompareResult(null);
    setError(null);
    setErrorTime(null);
    setStage("analyzing");

    try {
      const formData = new FormData();
      formData.append("file1", fileA);
      formData.append("file2", fileB);

      const result = await checkPlagiarismCompare(null, formData);

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "An unexpected error occurred.");
      }

      setCompareResult(result.data);
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setErrorTime(new Date());
      setStage("error");
    }
  }, [fileA, fileB]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setStage("upload");
    setError(null);
    setErrorTime(null);
    setCompareResult(null);
    setWebResult(null);
    if (webPreview) { URL.revokeObjectURL(webPreview); setWebPreview(null); setWebFile(null); }
    if (previewA) { URL.revokeObjectURL(previewA); setPreviewA(null); setFileA(null); }
    if (previewB) { URL.revokeObjectURL(previewB); setPreviewB(null); setFileB(null); }
  }, [webPreview, previewA, previewB]);

  const handleModeChange = useCallback((m: Mode) => {
    handleReset();
    setMode(m);
  }, [handleReset]);

  const handleCopyErrorReport = useCallback(async () => {
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
  }, [mode, errorTime, error]);

  return {
    // State
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

    // Handlers
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
  };
}
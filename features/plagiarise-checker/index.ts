export { AnalyzingScreen } from "./components/AnalyzingScreen";
export { CompareModeResult } from "./components/CompareModeResult";
export { CompareModeUpload } from "./components/CompareModeUpload";
export { EvidenceNote } from "./components/EvidenceNote";
export { HashTable } from "./components/HashTable";
export { MatchCard } from "./components/MatchCard";
export { ModeToggle } from "./components/ModeToggle";
export { SimilarityBar } from "./components/SimilarityBar";
export { SimilarityRing } from "./components/SimilarityRing";
export { UploadZone } from "./components/UploadZone";
export { WebModeResult } from "./components/WebModeResult";
export { WebModeUpload } from "./components/WebModeUpload";
export { OnlineCheckChip, WebOnlineStatus } from "./components/WebOnlineStatus";

export { usePlagiarismChecker } from "./hooks/use-plagiarism-checker";

// Client-direct analysis transport & shared error mapping. See lib/api-client.ts
// for why analysis uploads bypass Server Actions.
export { checkPlagiarismCompareFiles, checkPlagiarismWebFile } from "./lib/api-client";
export { describeAnalysisError } from "@/lib/analysis-errors";

export type {
  Stage,
  Mode,
  CompareResponse,
  SearchResponse,
  SearchMatch,
  HashSet,
  MatchMetrics,
  OtherSearchMatch,
  WebDiagnostics,
  WebDiagnosticsStatus,
} from "./types";

export {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  isLowContent,
  getDominantTransformLabel,
} from "./lib/match-metrics";

import { PlagiarismWebResult } from "./types";

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function shortenHash(hash: string) {
  if (!hash) return "";
  const start = hash.slice(0, 3);
  const end = hash.slice(-3);
  return `${start}......${end}`;
}

export const truncateText = (str: string, limit: number) => {
  if (str.length > limit) {
    // Slice the string and add "..."
    return str.slice(0, limit) + "...";
  }
  return str;
};

export async function checkPlagiarismWeb(
  file: File,
): Promise<PlagiarismWebResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DIGITAL_ART_API_URL}/plagiarism/check/web`,
    {
      method: "POST",
      body: formData,
      // Backend may poll Cloudinary readiness (up to ~15s extra); allow 90s.
      signal: AbortSignal.timeout(90_000),
    },
  );

  if (!response.ok) {
    // Guard against HTML error pages from HF proxy
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Server error (${response.status}): ${text.slice(0, 200)}`);
    }

    const error = await response.json();
    throw new Error(error.detail ?? "Failed to check plagiarism");
  }

  return response.json();
}

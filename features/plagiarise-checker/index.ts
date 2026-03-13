export { AnalyzingScreen } from "./components/AnalyzingScreen";
export { CircleProgress } from "./components/CircleProgress";
export { CompareModeResult } from "./components/CompareModeResult";
export { CompareModeUpload } from "./components/CompareModeUpload";
export { HashCollisionMap } from "./components/HashCollisionMap";
export { ModeToggle } from "./components/ModeToggle";
export { ScoreCard } from "./components/ScoreCard";
export { StepBadge } from "./components/StepBadge";
export { UploadZone } from "./components/UploadZone";
export { WebModeResult } from "./components/WebModeResult";
export { WebModeUpload } from "./components/WebModeUpload";
export type { Stage, Mode } from "./types";

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

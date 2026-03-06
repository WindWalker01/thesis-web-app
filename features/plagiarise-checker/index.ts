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

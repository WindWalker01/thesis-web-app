import { Badge } from "@/components/ui/badge";
import { Globe, ArrowLeftRight } from "lucide-react";
import { Mode } from "./../types";

interface AnalyzingScreenProps {
  progress: number;
  mode: Mode;
}

const STEPS: Record<Mode, string[]> = {
  web: [
    "Extracting features",
    "Web crawling",
    "Hash comparison",
    "Building report",
  ],
  compare: [
    "Extracting features",
    "Hash comparison",
    "Region mapping",
    "Building report",
  ],
};

export function AnalyzingScreen({ progress, mode }: AnalyzingScreenProps) {
  const steps = STEPS[mode];

  return (
    <div className="bg-card border-border flex flex-col items-center gap-6 rounded-2xl border p-16 text-center">
      <div className="bg-primary shadow-primary/30 flex h-20 w-20 animate-pulse items-center justify-center rounded-full shadow-2xl">
        {mode === "web" ? (
          <Globe size={34} className="text-primary-foreground" />
        ) : (
          <ArrowLeftRight size={34} className="text-primary-foreground" />
        )}
      </div>

      <div>
        <h2 className="text-foreground text-xl font-bold">
          {mode === "web" ? "Searching the Web" : "Comparing Images"}
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {mode === "web"
            ? "Cross-referencing against millions of records online…"
            : "Running perceptual hash comparison between both images…"}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">pHash fingerprinting</span>
          <span className="text-primary font-mono">{progress}%</span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary shadow-primary/50 h-full rounded-full shadow-sm transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((step, i) => (
          <Badge
            key={step}
            variant={progress > i * 25 ? "default" : "outline"}
            className="text-[11px] transition-all duration-300"
          >
            {step}
          </Badge>
        ))}
      </div>
    </div>
  );
}

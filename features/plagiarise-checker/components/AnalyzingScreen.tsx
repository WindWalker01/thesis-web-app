import { Badge } from "@/components/ui/badge";
import { Globe, ArrowLeftRight } from "lucide-react";
import { Mode } from "../types";

interface AnalyzingScreenProps {
  progress?: number;
  mode: Mode;
  /** When true, shows an animated indeterminate bar instead of a fixed progress value */
  indeterminate?: boolean;
}

const STEPS: Record<Mode, string[]> = {
  web: ["Fingerprinting", "DB lookup", "Web crawl", "Ranking results"],
  compare: ["Fingerprinting", "Transform hashes", "Block hashes", "Scoring"],
};

export function AnalyzingScreen({ progress = 0, mode, indeterminate = false }: AnalyzingScreenProps) {
  const steps = STEPS[mode];

  return (
    <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center text-center gap-6">
      <style>{`
        @keyframes indeterminate {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .bar-indeterminate { animation: indeterminate 1.4s ease infinite; }
      `}</style>

      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
        {mode === "web"
          ? <Globe size={34} className="text-primary-foreground" />
          : <ArrowLeftRight size={34} className="text-primary-foreground" />
        }
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground">
          {mode === "web" ? "Searching Web & Database" : "Comparing Images"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          {mode === "web"
            ? "Running perceptual hash lookup across DB and web sources…"
            : "Computing transform and block similarities…"}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">pHash analysis</span>
          {!indeterminate && <span className="text-primary font-mono">{progress}%</span>}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
          {indeterminate ? (
            <div className="bar-indeterminate absolute inset-y-0 w-1/3 bg-primary rounded-full shadow-sm shadow-primary/50" />
          ) : (
            <div
              className="h-full bg-primary rounded-full transition-all duration-200 shadow-sm shadow-primary/50"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {steps.map((step, i) => (
          <Badge
            key={step}
            variant={indeterminate || progress > i * 25 ? "default" : "outline"}
            className="text-[11px] transition-all duration-300"
          >
            {step}
          </Badge>
        ))}
      </div>
    </div>
  );
}

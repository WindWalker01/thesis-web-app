import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import {
  DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  getSimilarityColor,
} from "../lib/similarity-risk";

interface SimilarityBarProps {
  label: string;
  value: number;       // 0–100
  sublabel?: string;
  /** Admin-synced thresholds (critical = red, moderate = amber). Defaults to shared fallbacks. */
  thresholds?: SimilarityRiskThresholds;
}

export function SimilarityBar({ label, value, sublabel, thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS }: SimilarityBarProps) {
  const color = getSimilarityColor(value, thresholds);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {sublabel && <span className="text-[10px] text-muted-foreground ml-1.5">{sublabel}</span>}
        </div>
        <span className="text-sm font-mono font-bold" style={{ color }}>{value.toFixed(2)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  );
}

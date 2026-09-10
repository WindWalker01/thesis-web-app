import type { SimilarityRiskThresholds } from "../lib/similarity-risk";
import {
  DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  getSimilarityColor,
  getSimilarityRiskLabel,
} from "../lib/similarity-risk";

interface SimilarityRingProps {
  value: number; // 0–100
  label?: string; // line below the number
  size?: number; // svg size in px, default 120
  /** Admin-synced thresholds (critical = red, moderate = amber). Defaults to shared fallbacks. */
  thresholds?: SimilarityRiskThresholds;
}

export function SimilarityRing({
  value,
  label,
  size = 120,
  thresholds = DEFAULT_SIMILARITY_RISK_THRESHOLDS,
}: SimilarityRingProps) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = getSimilarityColor(value, thresholds);
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = size * 0.19;
  const subFontSize = size * 0.09;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        className="stroke-muted"
        strokeWidth={size * 0.07}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.07}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x={cx}
        y={cy - fontSize * 0.15}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="inherit"
        className="fill-foreground"
      >
        {value.toFixed(1)}%
      </text>
      <text
        x={cx}
        y={cy + fontSize * 0.7}
        textAnchor="middle"
        fontSize={subFontSize}
        fontWeight="600"
        fontFamily="inherit"
        className="fill-muted-foreground"
      >
        {label ?? getSimilarityRiskLabel(value, thresholds)}
      </text>
    </svg>
  );
}

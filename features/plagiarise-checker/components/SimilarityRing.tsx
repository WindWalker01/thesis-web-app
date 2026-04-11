interface SimilarityRingProps {
  value: number;       // 0–100
  label?: string;      // line below the number
  size?: number;       // svg size in px, default 120
}

function getColor(value: number) {
  if (value >= 85) return "#ef4444";   // red  — critical
  if (value >= 60) return "#f59e0b";   // amber — moderate
  return "#22c55e";                     // green — low / safe
}

function getRiskLabel(value: number) {
  if (value >= 85) return "Critical";
  if (value >= 60) return "Moderate";
  return "Low Risk";
}

export function SimilarityRing({ value, label, size = 120 }: SimilarityRingProps) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = getColor(value);
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = size * 0.19;
  const subFontSize = size * 0.09;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={size * 0.07} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color}
        strokeWidth={size * 0.07}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x={cx} y={cy - fontSize * 0.15} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={fontSize} fontWeight="700" fontFamily="inherit">
        {value.toFixed(1)}%
      </text>
      <text x={cx} y={cy + fontSize * 0.7} textAnchor="middle" fill={color} fontSize={subFontSize} fontWeight="600" fontFamily="inherit">
        {label ?? getRiskLabel(value)}
      </text>
    </svg>
  );
}

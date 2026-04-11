interface SimilarityBarProps {
  label: string;
  value: number;       // 0–100
  sublabel?: string;
}

function getColor(value: number) {
  if (value >= 85) return "#ef4444";
  if (value >= 60) return "#f59e0b";
  return "#22c55e";
}

export function SimilarityBar({ label, value, sublabel }: SimilarityBarProps) {
  const color = getColor(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {sublabel && <span className="text-[10px] text-muted-foreground ml-1.5">{sublabel}</span>}
        </div>
        <span className="text-xs font-mono font-bold" style={{ color }}>{value.toFixed(2)}%</span>
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

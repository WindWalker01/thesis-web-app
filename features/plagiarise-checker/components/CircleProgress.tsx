interface CircleProgressProps {
  value: number;
}

export function CircleProgress({ value }: CircleProgressProps) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 80 ? "#ef4444" : value >= 75 ? "#f59e0b" : "#22c55e";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="10"
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x="70"
        y="76"
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize="24"
        fontWeight="700"
        fontFamily="inherit"
      >
        {value}%
      </text>
      <text
        x="70"
        y="98"
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        fontSize="8"
        fontFamily="inherit"
      >
        MATCH
      </text>
    </svg>
  );
}

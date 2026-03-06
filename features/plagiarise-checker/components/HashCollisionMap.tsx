export function HashCollisionMap() {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    h: Math.sin(i * 0.7) * 0.4 + 0.6,
    match: i % 3 !== 2,
  }));

  return (
    <div className="flex h-9 w-full items-end gap-[3px]">
      {bars.map((b, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${b.h * 100}%`,
            background: b.match
              ? "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary)/0.6))"
              : "hsl(var(--muted))",
          }}
        />
      ))}
    </div>
  );
}

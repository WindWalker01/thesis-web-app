interface StepBadgeProps {
  n: string;
  label: string;
  desc: string;
}

export function StepBadge({ n, label, desc }: StepBadgeProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-background border-border text-primary mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] font-bold">
        {n}
      </div>
      <div>
        <p className="text-foreground text-sm font-semibold">{label}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{desc}</p>
      </div>
    </div>
  );
}

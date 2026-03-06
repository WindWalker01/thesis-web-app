import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CircleProgress } from "./CircleProgress";
import { HashCollisionMap } from "./HashCollisionMap";

interface ScoreCardProps {
  value: number;
  label: string;
  description: string;
  onReport?: () => void;
}

export function ScoreCard({
  value,
  label,
  description,
  onReport,
}: ScoreCardProps) {
  return (
    <div className="bg-card border-border flex w-44 flex-col items-center gap-4 rounded-2xl border p-5">
      <CircleProgress value={value} />

      <div className="bg-destructive/10 border-destructive/25 w-full rounded-lg border px-3 py-2 text-center">
        <p className="text-destructive text-xs font-bold">{label}</p>
      </div>

      <p className="text-muted-foreground text-center text-[11px] leading-relaxed">
        {description}
      </p>

      <div className="w-full space-y-2">
        <p className="text-muted-foreground text-[10px] font-bold tracking-widest">
          HASH COLLISION MAP
        </p>
        <HashCollisionMap />
      </div>

      <Button
        variant="destructive"
        size="sm"
        className="w-full gap-1.5 text-xs"
        onClick={onReport}
      >
        <AlertTriangle size={12} />
        Report Plagiarism
      </Button>
    </div>
  );
}

import { Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/client-utils";

interface EvidenceNoteProps {
  /** Explainability line, e.g. "0 of 5 regions matched". Null = legacy response. */
  evidence: string | null;
  /** True when the uploaded/compared image lacked content-bearing blocks. */
  lowContent?: boolean;
  className?: string;
}

/**
 * Explainability layer behind a plagiarism score or clean-negative state:
 * shows the block/transform agreement summary and a low-detail caveat when
 * the API flagged the image as low content (v2 fields; renders nothing at
 * all when a legacy response carries neither).
 */
export function EvidenceNote({ evidence, lowContent, className }: EvidenceNoteProps) {
  if (!evidence && !lowContent) return null;

  return (
    <div className={cn("space-y-1", className)}>
      {evidence && (
        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>{evidence}</span>
        </p>
      )}
      {lowContent && (
        <p className="flex items-start gap-1.5 text-[11px] text-amber-500/90">
          <TriangleAlert size={12} className="mt-0.5 shrink-0" />
          <span>Low image detail — result may be less reliable.</span>
        </p>
      )}
    </div>
  );
}

import { Info, TriangleAlert, Hash } from "lucide-react";
import { cn } from "@/lib/client-utils";

interface EvidenceNoteProps {
  /** Explainability line, e.g. "0 of 5 regions matched". Null = legacy response. */
  evidence: string | null;
  /** Enhanced evidence detail with dominant transform or evidence status (v3). */
  evidenceDetail?: string | null;
  /** True when the uploaded/compared image lacked content-bearing blocks. */
  lowContent?: boolean;
  /** v3: transform evidence status for additional context. */
  transformEvidenceStatus?: "absent" | "checked" | null;
  /** v3: block evidence status for additional context. */
  blockEvidenceStatus?: "absent" | "checked" | null;
  className?: string;
}

/**
 * Explainability layer behind a plagiarism score or clean-negative state:
 * shows the block/transform agreement summary and a low-detail caveat when
 * the API flagged the image as low content (v2 fields; renders nothing at
 * all when a legacy response carries neither).
 */
export function EvidenceNote({
  evidence,
  evidenceDetail,
  lowContent,
  transformEvidenceStatus,
  blockEvidenceStatus,
  className,
}: EvidenceNoteProps) {
  if (!evidence && !evidenceDetail && !lowContent && !transformEvidenceStatus && !blockEvidenceStatus) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      {(evidence || evidenceDetail) && (
        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>{evidenceDetail ?? evidence}</span>
        </p>
      )}
      {lowContent && (
        <p className="flex items-start gap-1.5 text-[11px] text-amber-500/90">
          <TriangleAlert size={12} className="mt-0.5 shrink-0" />
          <span>Low image detail — result may be less reliable.</span>
        </p>
      )}
      {transformEvidenceStatus === "absent" && blockEvidenceStatus !== "absent" && (
        <p className="flex items-start gap-1.5 text-[11px] text-amber-500/90">
          <Hash size={12} className="mt-0.5 shrink-0" />
          <span>Matched on image content only — no rotation/flip detected (likely a crop).</span>
        </p>
      )}
      {blockEvidenceStatus === "absent" && transformEvidenceStatus !== "absent" && (
        <p className="flex items-start gap-1.5 text-[11px] text-amber-500/90">
          <Hash size={12} className="mt-0.5 shrink-0" />
          <span>Matched on transform evidence only — no content-bearing blocks found.</span>
        </p>
      )}
    </div>
  );
}

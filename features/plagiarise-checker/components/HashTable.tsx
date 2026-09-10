import { HashSet } from "../types";
import { BLOCK_LABELS, TRANSFORM_LABELS, formatBlockKey, isScalePrefixedBlockKey } from "./hash-labels";

interface HashTableProps {
  title: string;
  hashes: Record<string, HashSet>;
}

function formatKey(key: string, isBlockTable: boolean) {
  if (isBlockTable) {
    return formatBlockKey(key);
  }
  return TRANSFORM_LABELS[key] ?? BLOCK_LABELS[key] ?? key;
}

export function HashTable({ title, hashes }: HashTableProps) {
  const entries = Object.entries(hashes);
  // Detect if this is a block table with scale-prefixed keys (v3)
  const isBlockTable = entries.some(([key]) => isScalePrefixedBlockKey(key));
  // v2: block regions may carry per-block entropy; only render the column
  // when at least one entry has it (transform tables don't).
  const showEntropy = entries.some(([, val]) => typeof val.entropy === "number");

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{title}</p>
      <div className="overflow-x-auto rounded-xl border border-border">
        {/* Header */}
        <div className={`grid gap-0 border-b border-border bg-muted/40 px-3 py-2 ${showEntropy ? "min-w-[600px] grid-cols-[80px_1fr_1fr_1fr_70px]" : "min-w-[520px] grid-cols-[80px_1fr_1fr_1fr]"}`}>
          {["Region", "pHash", "dHash", "wHash", ...(showEntropy ? ["Entropy"] : [])].map((h) => (
            <p key={h} className="text-[10px] font-bold tracking-widest text-muted-foreground">{h}</p>
          ))}
        </div>
        {entries.map(([key, val], i) => (
          <div
            key={key}
            className={`grid gap-0 px-3 py-2 transition-colors hover:bg-muted/20 ${showEntropy ? "min-w-[600px] grid-cols-[80px_1fr_1fr_1fr_70px]" : "min-w-[520px] grid-cols-[80px_1fr_1fr_1fr]"} ${
              i < entries.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <p className="text-[11px] font-semibold text-foreground">{formatKey(key, isBlockTable)}</p>
            {[val.phash, val.dhash, val.whash].map((h, j) => (
              <p key={j} className="text-[10px] font-mono text-muted-foreground truncate pr-2">{h}</p>
            ))}
            {showEntropy && (
              <p className="text-[10px] font-mono text-muted-foreground">
                {typeof val.entropy === "number" ? val.entropy.toFixed(2) : "—"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

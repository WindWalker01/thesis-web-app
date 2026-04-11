import { HashSet } from "./types";

interface HashTableProps {
  title: string;
  hashes: Record<string, HashSet>;
}

const TRANSFORM_LABELS: Record<string, string> = {
  "0": "0°",
  "90": "90°",
  "180": "180°",
  "270": "270°",
  "mirror": "Mirror",
  "flip": "Flip",
};

const BLOCK_LABELS: Record<string, string> = {
  top_left: "Top Left",
  top_right: "Top Right",
  bottom_left: "Bottom Left",
  bottom_right: "Bottom Right",
  center: "Center",
};

function formatKey(key: string) {
  return TRANSFORM_LABELS[key] ?? BLOCK_LABELS[key] ?? key;
}

export function HashTable({ title, hashes }: HashTableProps) {
  const entries = Object.entries(hashes);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{title}</p>
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-0 bg-muted/40 border-b border-border px-3 py-2">
          {["Region", "pHash", "dHash", "wHash"].map((h) => (
            <p key={h} className="text-[10px] font-bold tracking-widest text-muted-foreground">{h}</p>
          ))}
        </div>
        {entries.map(([key, val], i) => (
          <div
            key={key}
            className={`grid grid-cols-[80px_1fr_1fr_1fr] gap-0 px-3 py-2 hover:bg-muted/20 transition-colors ${
              i < entries.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <p className="text-[11px] font-semibold text-foreground">{formatKey(key)}</p>
            {[val.phash, val.dhash, val.whash].map((h, j) => (
              <p key={j} className="text-[10px] font-mono text-muted-foreground truncate pr-2">{h}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

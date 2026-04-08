import { X } from "lucide-react";
import type { HashStatus, ArtworkStatus } from "../types";
import { formatArtworkStatusLabel } from "..";

type Props = {
  selectedCategory: string | null;
  selectedStatus: ArtworkStatus | null;
  selectedHash: HashStatus | null;
  onClearCategory: () => void;
  onClearStatus: () => void;
  onClearHash: () => void;
  onClearAll: () => void;
};

export function ActiveFilterChips({
  selectedCategory,
  selectedStatus,
  selectedHash,
  onClearCategory,
  onClearStatus,
  onClearHash,
  onClearAll,
}: Props) {
  const hasAny = selectedCategory || selectedStatus || selectedHash;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {selectedCategory && (
        <Chip color="primary" onRemove={onClearCategory}>
          {selectedCategory}
        </Chip>
      )}
      {selectedStatus && (
        <Chip color="orange" onRemove={onClearStatus}>
          {formatArtworkStatusLabel(selectedStatus)}
        </Chip>
      )}
      {selectedHash && (
        <Chip color="purple" onRemove={onClearHash}>
          Hash: {selectedHash}
        </Chip>
      )}
      <button
        onClick={onClearAll}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2"
      >
        Clear all
      </button>
    </div>
  );
}

type ChipProps = {
  color: "primary" | "orange" | "purple";
  onRemove: () => void;
  children: React.ReactNode;
};

const chipStyles: Record<ChipProps["color"], string> = {
  primary: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20",
  orange: "bg-orange-500/10 border-orange-400/20 text-orange-500 hover:bg-orange-400/20",
  purple: "bg-purple-500/10 border-purple-400/20 text-purple-500 hover:bg-purple-400/20",
};

function Chip({ color, onRemove, children }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border text-xs font-semibold ${chipStyles[color]}`}
    >
      {children}
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 transition-colors"
        aria-label="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
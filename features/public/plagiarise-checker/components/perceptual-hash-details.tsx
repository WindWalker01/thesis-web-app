import { Hash } from "lucide-react";
import type { HashSet } from "../types";
import { HashTable } from "./HashTable";

interface PerceptualHashDetailsProps {
  transforms: Record<string, HashSet>;
  blocks: Record<string, HashSet>;
}

export function PerceptualHashDetails({
  transforms,
  blocks,
}: PerceptualHashDetailsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-6 sm:p-6">
      <div className="flex items-center gap-2">
        <Hash size={15} className="text-primary" />
        <p className="font-semibold text-foreground">Perceptual Hash Details</p>
      </div>
      <HashTable
        title="Transform Variants (0°, 90°, 180°, 270°, Mirror, Flip)"
        hashes={transforms}
      />
      <HashTable
        title="Block Regions (Multi-Scale: 0.625, 0.75, 1.0)"
        hashes={blocks}
      />
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ScoreCard } from "./ScoreCard";

import { ImageComparisonResponse } from "./../types";

interface CompareModeResultProps {
  previewA: string;
  previewB: string;
  results: ImageComparisonResponse | null;
}

export function CompareModeResult({
  previewA,
  previewB,
  results,
}: CompareModeResultProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
      {/* Image A */}
      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-md">
              <span className="text-primary-foreground text-[10px] font-bold">
                A
              </span>
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Original Artwork
              </p>
              <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                Uploaded by user
              </p>
            </div>
          </div>
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
            <ShieldCheck size={11} className="mr-1" /> Source
          </Badge>
        </div>

        <div className="relative">
          <Image
            src={previewA}
            alt="Image A"
            width={480}
            height={220}
            className="h-52 w-full object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
              FILE
            </p>
            <p className="text-foreground text-sm font-medium">image-a.jpg</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
              pHASH
            </p>
            <p className="text-primary font-mono text-xs">a3f8...91cd</p>
          </div>
        </div>
      </div>

      {/* Score */}
      <ScoreCard
        value={results?.result.distance.similarity_percentage ?? -1}
        label="High Similarity"
        description="Direct hash distance of 12 bits — highly similar"
      />

      {/* Image B */}
      <div className="bg-card border-destructive/20 overflow-hidden rounded-2xl border">
        <div className="border-destructive/15 bg-destructive/[0.02] flex items-center justify-between border-b px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="bg-destructive/80 flex h-6 w-6 items-center justify-center rounded-md">
              <span className="text-[10px] font-bold text-white">B</span>
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Suspected Copy
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Uploaded for comparison
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10"
          >
            Unverified
          </Badge>
        </div>

        <div className="relative">
          <Image
            src={previewB}
            alt="Image B"
            width={480}
            height={220}
            className="h-52 w-full object-cover"
          />
          <div className="bg-destructive/15 border-destructive/30 text-destructive absolute top-2 right-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] backdrop-blur-sm">
            <div className="bg-destructive h-1.5 w-1.5 animate-pulse rounded-full" />
            Highlight Overlap
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                FILE
              </p>
              <p className="text-foreground text-xs font-medium">image-b.jpg</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                pHASH
              </p>
              <p className="text-destructive font-mono text-xs">a3f2...88c1</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-widest">
              MODIFICATIONS DETECTED
            </p>
            <div className="flex flex-wrap gap-2">
              {["Cropped", "Color Shift", "Resized"].map((m) => (
                <Badge
                  key={m}
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-400"
                >
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ScoreCard } from "./ScoreCard";

import { ReverseSearchResponse } from "./../types";

interface WebModeResultProps {
  preview: string;
  results: ReverseSearchResponse | null;
}

export function WebModeResult({ preview, results }: WebModeResultProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
      {/* Original Artwork */}
      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Original Registered Artwork
            </p>
            <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
              ID: ORG-2291 · Uploaded: Oct 12, 2023
            </p>
          </div>
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
            <ShieldCheck size={11} className="mr-1" /> Protected
          </Badge>
        </div>

        <div className="relative">
          <Image
            src={preview}
            alt="Original"
            width={480}
            height={220}
            className="h-52 w-full object-cover"
          />
          <div className="absolute right-2 bottom-2 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[11px] text-slate-300 backdrop-blur-sm">
            4096 × 3112
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
              ARTIST
            </p>
            <p className="text-foreground text-sm font-medium">Elena Void</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
              RESOLUTION
            </p>
            <p className="text-foreground text-sm font-medium">
              4096 × 3112 px
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
              DIGITAL SIGNATURE
            </p>
            <p className="text-primary font-mono text-xs">0x7f83...a2b5</p>
          </div>
        </div>
      </div>

      {/* Score */}
      <ScoreCard
        value={results?.progress ?? -1}
        label="High Probability"
        description="Structural similarity index exceeds threshold of 75%"
      />

      {/* Suspected Infringement */}
      <div className="bg-card border-destructive/20 overflow-hidden rounded-2xl border">
        <div className="border-destructive/15 bg-destructive/[0.02] flex items-center justify-between border-b px-5 py-3.5">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Suspected Infringement
            </p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              Found: Today, 09:41 AM
            </p>
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
            src={preview}
            alt="Suspected copy"
            width={480}
            height={220}
            className="h-52 w-full object-cover"
            style={{
              filter: "hue-rotate(40deg) saturate(1.3) brightness(0.9)",
            }}
          />
          <div className="bg-destructive/15 border-destructive/30 text-destructive absolute top-2 right-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] backdrop-blur-sm">
            <div className="bg-destructive h-1.5 w-1.5 animate-pulse rounded-full" />
            Highlight Overlap
          </div>
          <div className="absolute right-2 bottom-2 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[11px] text-slate-300 backdrop-blur-sm">
            1024 × 768
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                SOURCE
              </p>
              <a
                href={Object.keys(results?.result.distances ?? {})[0]}
                className="text-destructive font-mono text-xs"
              >
                {Object.keys(results?.result.distances ?? {})[0]}
              </a>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                RESOLUTION
              </p>
              <p className="text-foreground text-xs">
                1024 × 768 px (Downscaled)
              </p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-widest">
              MODIFICATIONS DETECTED
            </p>
            <div className="flex flex-wrap gap-2">
              {["Cropped", "Color Shift", "+Other"].map((m) => (
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

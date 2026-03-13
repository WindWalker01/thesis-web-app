import { Badge } from "@/components/ui/badge";
import { ScanSearch, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ScoreCard } from "./ScoreCard";

import { shortenHash, truncateText } from "..";

import { ReverseSearchResponse } from "./../types";

interface WebModeResultProps {
  preview: string;
  results: ReverseSearchResponse | null;
  timeFound: string;
}

export function WebModeResult({
  preview,
  results,
  timeFound,
}: WebModeResultProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
      {/* Original Artwork */}
      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Uploaded Artwork
            </p>
          </div>

          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
            <ShieldCheck size={11} className="mr-1" /> Uploaded
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
        </div>

        <div className="grid grid-cols-4 gap-4 p-5">
          <div>
            <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
              FILENAME
            </p>
            <p className="text-foreground text-sm font-medium">
              {truncateText(results?.result.filename ?? "Unknown", 14)}
            </p>
          </div>
          <div></div>
          <div className="col-span-2">
            <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
              PERCEPTUAL HASH
            </p>
            <p className="text-primary font-mono text-xs">
              {shortenHash(
                Object.values(results?.result.hashes ?? {})[0].phash,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Score */}
      <ScoreCard
        value={
          Object.values(results?.result.distances ?? {})[0]
            .similarity_percentage ?? -1
        }
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
              Found: Today, {timeFound}
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/10"
          >
            <ScanSearch size={11} className="mr-1" />
            Similar Artwork
          </Badge>
        </div>

        <div className="relative">
          <Image
            src={
              Object.values(results?.result.distances ?? {})[0]?.url ?? preview
            }
            alt="Suspected copy"
            width={480}
            height={220}
            className="h-52 w-full object-cover"
            unoptimized
          />
        </div>

        <div className="space-y-4 p-5">
          <div className="">
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                SOURCE
              </p>
              <a
                href={Object.values(results?.result.distances ?? {})[0].link}
                className="text-destructive font-mono text-xs"
              >
                {Object.values(results?.result.distances ?? {})[0].source ??
                  "Unknown"}
                : {Object.values(results?.result.distances ?? {})[0].link ?? ""}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

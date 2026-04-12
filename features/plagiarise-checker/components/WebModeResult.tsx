import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Hash, AlertCircle } from "lucide-react";
import Image from "next/image";
import { SearchResponse } from "../types";
import { MatchCard } from "./MatchCard";
import { HashTable } from "./HashTable";
import { SimilarityRing } from "./SimilarityRing";
import Link from "next/link";

interface WebModeResultProps {
  preview: string;
  result: SearchResponse;
}

function NoMatchNote({ label }: { label: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3 text-muted-foreground">
      <AlertCircle size={15} className="shrink-0" />
      <p className="text-sm">No {label} match found.</p>
    </div>
  );
}

export function WebModeResult({ preview, result }: WebModeResultProps) {
  const isBestDb = result.best_match?.type === "database";

  // The third card always shows the best match — whichever scored higher
  const bestMatch = isBestDb ? result.db : result.web;

  return (
    <div className="space-y-5">
      {/* Top row: submitted image + best match ring + best match summary */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">

        {/* Submitted image */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div>
              <p className="font-semibold text-sm text-foreground">Submitted Artwork</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{result.filename}</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
              <ShieldCheck size={11} className="mr-1" /> Analyzed
            </Badge>
          </div>
          <Image src={preview} alt="Submitted artwork" width={480} height={220} className="w-full h-52 object-cover" />
          <div className="p-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">FILENAME</p>
              <p className="text-sm text-foreground font-mono truncate">{result.filename}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">ORIGINAL HASH</p>
              <p className="text-xs text-primary font-mono">{result.original_hash}</p>
            </div>
          </div>
        </div>

        {/* Best match ring */}
        {result.best_match ? (
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-4 w-48">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground text-center">BEST MATCH</p>
            <SimilarityRing value={result.best_match.similarity} size={130} />
            <div className="w-full text-center space-y-1.5">
              <p className="text-xs font-semibold text-foreground">{result.best_match.source}</p>
              <Badge
                variant="outline"
                className={`text-[10px] capitalize ${isBestDb
                  ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                  : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                  }`}
              >
                {result.best_match.type}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 w-48 text-center min-h-[180px]">
            <AlertCircle size={28} className="text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No matches found</p>
          </div>
        )}

        {/* Best match summary card — DB: show image | Internet: show source + URL */}
        {bestMatch ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {isBestDb ? "Database Match" : "Web Match"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{bestMatch.source}</p>
              </div>
              <SimilarityRing value={bestMatch.similarity} size={52} />
            </div>

            {/* DB best match: render the registered artwork image */}
            {isBestDb && bestMatch.imageUrl ? (
              <div className="relative w-full h-44 bg-muted">
                <Image
                  src={bestMatch.imageUrl}
                  alt={bestMatch.title ?? "Registered artwork"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="p-5 space-y-3">
              {/* DB: show resolved title */}
              {isBestDb && bestMatch.title && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">TITLE</p>
                  <p className="text-xs text-foreground font-medium">{bestMatch.title}</p>
                </div>
              )}

              {/* DB: Cloudinary image URL or fallback UUID */}
              {isBestDb && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">IMAGE URL</p>
                  {bestMatch.imageUrl ? (
                    <Link
                      href={bestMatch.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-mono break-all underline underline-offset-2 hover:opacity-75 transition-opacity"
                    >
                      {bestMatch.imageUrl}
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground font-mono break-all">{bestMatch.url}</p>
                  )}
                </div>
              )}

              {/* Internet: source page link */}
              {!isBestDb && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">SOURCE URL</p>
                  <a
                    href={bestMatch.link ?? bestMatch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-mono break-all underline underline-offset-2 hover:opacity-75 transition-opacity"
                  >
                    {bestMatch.link ?? bestMatch.url}
                  </a>
                </div>
              )}

              {/* Internet: direct asset URL (only if different from link) */}
              {!isBestDb && bestMatch.link && bestMatch.url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">ASSET URL</p>
                  <a
                    href={bestMatch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground font-mono break-all underline underline-offset-2 hover:opacity-75 transition-opacity"
                  >
                    {bestMatch.url}
                  </a>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">TYPE</p>
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${isBestDb
                    ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                    : "text-sky-400 border-sky-500/30 bg-sky-500/10"
                    }`}
                >
                  {bestMatch.type}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-3 text-muted-foreground">
            <AlertCircle size={15} className="shrink-0" />
            <p className="text-sm">No match found.</p>
          </div>
        )}
      </div>

      {/* Web match full card */}
      {result.web
        ? <MatchCard match={result.web} isBest={!isBestDb} />
        : <NoMatchNote label="web" />
      }

      {/* DB match full card */}
      {result.db
        ? <MatchCard match={result.db} isBest={isBestDb} />
        : <NoMatchNote label="database" />
      }

      {/* Hash tables */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Hash size={15} className="text-primary" />
          <p className="font-semibold text-foreground">Perceptual Hash Details</p>
        </div>
        <HashTable
          title="Transform Variants (0°, 90°, 180°, 270°, Mirror, Flip)"
          hashes={result.hashes.transforms}
        />
        <HashTable
          title="Block Regions (Top Left, Top Right, Bottom Left, Bottom Right, Center)"
          hashes={result.hashes.blocks}
        />
      </div>
    </div>
  );
}
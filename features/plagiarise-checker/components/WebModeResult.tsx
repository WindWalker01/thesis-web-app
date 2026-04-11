import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Hash, AlertCircle } from "lucide-react";
import Image from "next/image";
import { SearchResponse } from "./types";
import { MatchCard } from "./MatchCard";
import { HashTable } from "./HashTable";
import { SimilarityRing } from "./SimilarityRing";

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

  return (
    <div className="space-y-5">
      {/* Top row: image + best match ring + DB summary */}
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
                className={`text-[10px] capitalize ${
                  result.best_match.type === "database"
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

        {/* DB match summary */}
        {result.db ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <p className="font-semibold text-sm text-foreground">Database Match</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{result.db.source}</p>
              </div>
              <SimilarityRing value={result.db.similarity} size={52} />
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">URL</p>
                <p className="text-xs text-primary font-mono break-all">{result.db.url}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">TYPE</p>
                <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 bg-indigo-500/10 text-[10px] capitalize">
                  {result.db.type}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-3 text-muted-foreground">
            <AlertCircle size={15} className="shrink-0" />
            <p className="text-sm">No registered artwork found in the database.</p>
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

import { Badge } from "@/components/ui/badge";
import { Database, Globe, ExternalLink, Trophy } from "lucide-react";
import { SearchMatch } from "./types";
import { SimilarityRing } from "./SimilarityRing";

interface MatchCardProps {
  match: SearchMatch;
  isBest?: boolean;
}

function getRiskBadge(similarity: number) {
  if (similarity >= 85) return { label: "Critical Match", className: "text-red-400 border-red-500/30 bg-red-500/10" };
  if (similarity >= 60) return { label: "Moderate Match", className: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
  return { label: "Low Match", className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
}

export function MatchCard({ match, isBest }: MatchCardProps) {
  const isDb = match.type === "database";
  const risk = getRiskBadge(match.similarity);
  const href = match.link ?? match.url;

  return (
    <div className={`bg-card rounded-2xl border overflow-hidden transition-all ${
      isBest ? "border-primary/40 shadow-sm shadow-primary/10" : "border-border"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
        isBest ? "bg-primary/5 border-primary/20" : "border-border"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isDb ? "bg-indigo-500/15 text-indigo-400" : "bg-sky-500/15 text-sky-400"
          }`}>
            {isDb ? <Database size={15} /> : <Globe size={15} />}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{match.source}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{match.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isBest && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1">
              <Trophy size={9} /> Best Match
            </Badge>
          )}
          <Badge variant="outline" className={`text-[10px] ${risk.className}`}>
            {risk.label}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex items-center gap-6">
        {/* Ring */}
        <div className="shrink-0">
          <SimilarityRing value={match.similarity} size={100} />
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
              {isDb ? "DATABASE URL" : "SOURCE LINK"}
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-mono underline-offset-2 hover:underline flex items-center gap-1 break-all"
            >
              {href.length > 60 ? href.slice(0, 60) + "…" : href}
              <ExternalLink size={10} className="shrink-0" />
            </a>
          </div>

          {match.link && (
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">ASSET URL</p>
              <a
                href={match.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground font-mono underline-offset-2 hover:underline break-all"
              >
                {match.url.length > 60 ? match.url.slice(0, 60) + "…" : match.url}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

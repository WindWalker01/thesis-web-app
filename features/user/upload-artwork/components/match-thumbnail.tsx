import Image from "next/image";
import Link from "next/link";
import { Database, ExternalLink, Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getSimilarityLabel } from "@/features/(user)/upload-artwork/lib/similarity-display";

type MatchThumbnailProps = {
  imageUrl: string;
  similarity: number;
  label: string;
  href?: string;
  icon: "db" | "web";
};

/**
 * A single match tile in the "Other matches" grid. Renders the match image, its
 * source label, and a similarity qualifier. When `href` is present the whole
 * tile links out to the source.
 */
export function MatchThumbnail({
  imageUrl,
  similarity,
  label,
  href,
  icon,
}: MatchThumbnailProps) {
  const similarityLabel = getSimilarityLabel(similarity);

  const card = (
    <div className="group bg-background hover:border-primary/50 relative overflow-hidden rounded-lg border transition-colors">
      <div className="bg-muted relative aspect-square w-full">
        <Image
          src={imageUrl}
          alt={label}
          fill
          unoptimized
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <div className="space-y-2 p-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            {icon === "db" ? (
              <Database className="text-muted-foreground h-3 w-3 shrink-0" />
            ) : (
              <Globe className="text-muted-foreground h-3 w-3 shrink-0" />
            )}

            <span className="text-muted-foreground truncate text-[11px]">
              {label}
            </span>
          </div>

          {href && (
            <ExternalLink className="text-muted-foreground h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>

        <Badge variant="outline" className="w-fit text-[10px]">
          {similarityLabel}
        </Badge>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noreferrer">
        {card}
      </Link>
    );
  }

  return card;
}

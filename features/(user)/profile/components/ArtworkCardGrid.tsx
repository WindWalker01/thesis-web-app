import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Hash, ImageIcon } from "lucide-react";

import type { Artwork, ProfileScope } from "../types";
import { OwnershipBadge } from "./OwnershipBadge";
import { ArtworkStatusBadge } from "./ArtworkStatusBadge";

type Props = {
  art: Artwork;
  index: number;
  scope?: ProfileScope;
};

export function ArtworkCardGrid({ art, index, scope = "gallery" }: Props) {
  const href =
    scope === "issues" ? `/profile/issues/${art.id}` : `/profile/artworks/${art.id}`;

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.035, duration: 0.3 }}
        className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-[0_4px_24px_rgba(59,130,246,0.1)] transition-all duration-300 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden">
          {art.img ? (
            <Image
              src={art.img}
              alt={art.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className={`w-full h-full bg-linear-to-br ${art.color} flex items-center justify-center`}
            >
              <ImageIcon className="w-10 h-10 text-white/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-black/50 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {art.category}
            </span>
          </div>

          {art.hashStatus === "complete" && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center">
                <Hash className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-sm font-bold truncate mb-1">{art.title}</p>
          <p className="text-[10px] text-muted-foreground mb-2">{art.uploadDate}</p>

          <div className="flex flex-wrap items-center gap-2">
            <ArtworkStatusBadge status={art.status} />
            <OwnershipBadge status={art.ownershipStatus} />
            {art.hashStatus === "processing" && (
              <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                Processing…
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
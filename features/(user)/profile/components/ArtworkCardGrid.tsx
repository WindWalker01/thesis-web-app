import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Hash, ImageIcon } from "lucide-react";

import type { Artwork, ProfileScope } from "../types";
import { OwnershipBadge } from "./OwnershipBadge";
import { ArtworkStatusBadge } from "./ArtworkStatusBadge";
import { ArtworkActionsMenu } from "../subfeatures/artwork-detail/components/ArtworkActionsMenu";

type Props = {
    art: Artwork;
    index: number;
    scope?: ProfileScope;
};

export function ArtworkCardGrid({ art, index, scope = "gallery" }: Props) {
    const href =
        scope === "issues" ? `/profile/issues/${art.id}` : `/profile/artworks/${art.id}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035, duration: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_4px_24px_rgba(59,130,246,0.1)]"
        >
            <Link href={href} className="absolute inset-0 z-10" aria-label={`View ${art.title}`} />

            <div className="absolute right-2 top-2 z-20">
                <ArtworkActionsMenu
                    artId={art.id}
                    title={art.title}
                    description={art.description}
                    status={art.status}
                    txHash={art.txHash}
                    chain={art.chain}
                    workId={art.workId}
                    blockNumber={art.blockNumber}
                    className="rounded-full bg-black/45 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/65"
                />
            </div>

            <div className="relative aspect-square overflow-hidden">
                {art.img ? (
                    <Image
                        src={art.img}
                        alt={art.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div
                        className={`flex h-full w-full items-center justify-center bg-linear-to-br ${art.color}`}
                    >
                        <ImageIcon className="h-10 w-10 text-white/40" />
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                    <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                            <ExternalLink className="h-3.5 w-3.5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="absolute left-2 top-2 z-[1]">
                    <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                        {art.category}
                    </span>
                </div>

                {art.hashStatus === "complete" && (
                    <div className="absolute right-12 top-2 z-[1]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/80 backdrop-blur-sm">
                            <Hash className="h-3 w-3 text-white" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3">
                <p className="mb-1 truncate text-sm font-bold">{art.title}</p>
                <p className="mb-2 text-[10px] text-muted-foreground">{art.uploadDate}</p>

                <div className="flex flex-wrap items-center gap-2">
                    <ArtworkStatusBadge status={art.status} />
                    <OwnershipBadge status={art.ownershipStatus} />
                    {art.hashStatus === "processing" && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                            Processing…
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
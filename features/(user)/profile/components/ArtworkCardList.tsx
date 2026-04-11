import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Hash } from "lucide-react";

import type { Artwork, ProfileScope } from "../types";
import { OwnershipBadge } from "./OwnershipBadge";
import { ArtworkStatusBadge } from "./ArtworkStatusBadge";
import { ArtworkActionsMenu } from "../subfeatures/artwork-detail/components/ArtworkActionsMenu";

type Props = {
    art: Artwork;
    index: number;
    scope?: ProfileScope;
};

export function ArtworkCardList({ art, index, scope = "gallery" }: Props) {
    const href =
        scope === "issues" ? `/profile/issues/${art.id}` : `/profile/artworks/${art.id}`;

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.25 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-[0_2px_12px_rgba(59,130,246,0.08)]"
        >
            <Link href={href} className="absolute inset-0 z-10" aria-label={`View ${art.title}`} />

            <div className="flex items-center gap-4 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    {art.img ? (
                        <Image
                            src={art.img}
                            alt={art.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                        />
                    ) : (
                        <div className={`h-full w-full bg-linear-to-br ${art.color}`} />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{art.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {art.category} · {art.uploadDate}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <ArtworkStatusBadge status={art.status} />
                    <OwnershipBadge status={art.ownershipStatus} />
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${art.hashStatus === "complete"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                    >
                        <Hash className="h-2.5 w-2.5" />
                        {art.hashStatus === "complete" ? "Hashed" : "Processing"}
                    </span>
                </div>

                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative z-20 shrink-0">
                    <ArtworkActionsMenu
                        artId={art.id}
                        title={art.title}
                        description={art.description}
                        status={art.status}
                        txHash={art.txHash}
                        chain={art.chain}
                        workId={art.workId}
                        blockNumber={art.blockNumber}
                    />
                </div>
            </div>
        </motion.div>
    );
}
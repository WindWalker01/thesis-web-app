import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Hash } from "lucide-react";

import type { Artwork } from "../types";
import { OwnershipBadge } from "./OwnershipBadge";
import { ArtworkStatusBadge } from "./ArtworkStatusBadge";

type Props = {
    art: Artwork;
    index: number;
};

export function ArtworkCardList({ art, index }: Props) {
    return (
        <Link href={`/profile/artworks/${art.id}`}>
            <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-[0_2px_12px_rgba(59,130,246,0.08)] transition-all duration-200 cursor-pointer"
            >
                <div className="flex items-center gap-4 p-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                        {art.img ? (
                            <Image
                                src={art.img}
                                alt={art.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full bg-linear-to-br ${art.color}`} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{art.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {art.category} · {art.uploadDate}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <ArtworkStatusBadge status={art.status} />
                        <OwnershipBadge status={art.ownershipStatus} />
                        <span
                            className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full ${art.hashStatus === "complete"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-muted text-muted-foreground"
                                }`}
                        >
                            <Hash className="w-2.5 h-2.5" />
                            {art.hashStatus === "complete" ? "Hashed" : "Processing"}
                        </span>
                    </div>

                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
            </motion.div>
        </Link>
    );
}
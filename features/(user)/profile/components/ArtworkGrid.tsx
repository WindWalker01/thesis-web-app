import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";

import type { Artwork, ProfileScope, ViewMode } from "../types";
import { ArtworkCardGrid } from "./ArtworkCardGrid";
import { ArtworkCardList } from "./ArtworkCardList";

type Props = {
    artworks: Artwork[];
    viewMode: ViewMode;
    sidebarOpen: boolean;
    onClearFilters: () => void;
    scope?: ProfileScope;
};

export function ArtworkGrid({
    artworks,
    viewMode,
    sidebarOpen,
    onClearFilters,
    scope = "gallery",
}: Props) {
    return (
        <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
                {artworks.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
                        <p className="text-base font-bold text-muted-foreground">No artworks found</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">
                            Try adjusting your filters
                        </p>
                        <button
                            onClick={onClearFilters}
                            className="mt-4 text-sm text-primary hover:underline font-semibold"
                        >
                            Clear all filters
                        </button>
                    </motion.div>
                ) : viewMode === "grid" ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`grid gap-4 ${sidebarOpen
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                            }`}
                    >
                        {artworks.map((art, i) => (
                            <ArtworkCardGrid key={art.id} art={art} index={i} scope={scope} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                    >
                        {artworks.map((art, i) => (
                            <ArtworkCardList key={art.id} art={art} index={i} scope={scope} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ImageIcon, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LatestArtwork } from "../types";

type Props = {
  artworks: LatestArtwork[];
};

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  pending_blockchain: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  blockchain_failed: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  flagged: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  removed: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  revoked: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  under_review: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

export function LatestArtworks({ artworks }: Props) {
  if (artworks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest Artworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No artworks uploaded.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Latest Artworks</CardTitle>
        <p className="text-muted-foreground text-xs">Newest registrations</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {artworks.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <Link
                href={`/profile/artworks/${artwork.id}`}
                className="block"
              >
                <div className="aspect-square rounded-xl bg-muted overflow-hidden relative">
                  {artwork.thumbnail ? (
                    <img
                      src={artwork.thumbnail}
                      alt={artwork.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-sm font-medium truncate">{artwork.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {artwork.artist}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`${statusColor[artwork.blockchain_status] ?? ""} border-0 text-[10px] px-1.5 py-0`}
                  >
                    {artwork.blockchain_status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
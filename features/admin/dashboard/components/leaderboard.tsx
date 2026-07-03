"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Trophy, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopArtist } from "../types";

type Props = {
  artists: TopArtist[];
};

export function Leaderboard({ artists }: Props) {
  if (artists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Artists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trophy className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No artists yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Artists</CardTitle>
        <p className="text-muted-foreground text-xs">By community upvotes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {artists.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3"
            >
              {/* Rank */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                {i === 0 ? (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    #{i + 1}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {artist.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">
                    {artist.full_name || artist.username}
                  </p>
                  {artist.is_verified && (
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  @{artist.username} · {artist.artwork_count} artworks
                </p>
              </div>

              {/* Upvotes */}
              <div className="flex items-center gap-1 shrink-0">
                <Heart className="h-3.5 w-3.5 text-pink-500" />
                <span className="text-sm font-bold">
                  {artist.total_upvotes.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
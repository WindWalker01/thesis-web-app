"use client";

import Image from "next/image";
import { ImageIcon, User, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, cn } from "@/lib/client-utils";
import { ArtworkStatusBadge, NeedsReviewBadge } from "./ArtworkStatusBadge";
import type { ArtworkDetail } from "../types";

interface ArtworkPreviewProps {
  artwork: ArtworkDetail;
}

export function ArtworkPreview({ artwork }: ArtworkPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Artwork Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        {artwork.c_secure_url ? (
          <Image
            src={artwork.c_secure_url}
            alt={artwork.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Title & Status */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold leading-tight">{artwork.title}</h2>
          <div className="flex items-center gap-2 shrink-0">
            <ArtworkStatusBadge status={artwork.status} />
            {artwork.needs_review && <NeedsReviewBadge />}
          </div>
        </div>
        {artwork.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
            {artwork.description}
          </p>
        )}
      </div>

      <Separator />

      {/* Artist Info */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {artwork.owner.c_profile_image ? (
            <Image
              src={artwork.owner.c_profile_image}
              alt={artwork.owner.username}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {artwork.owner.first_name} {artwork.owner.last_name}
          </p>
          <p className="text-xs text-muted-foreground">@{artwork.owner.username}</p>
        </div>
        {artwork.owner.is_verified && (
          <Badge variant="secondary" className="text-[10px]">Verified</Badge>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Registered {formatDate(artwork.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Updated {formatDate(artwork.updated_at)}</span>
        </div>
      </div>

      {/* Genres */}
      {artwork.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {artwork.genres.map((genre) => (
            <Badge key={genre.id} variant="secondary">
              {genre.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
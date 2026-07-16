"use client";

import { memo } from "react";
import { Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTimeAgo } from "@/lib/client-utils";

interface ArtworkOwner {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string | null;
  c_profile_image: string | null;
}

interface ArtworkData {
  id: string;
  title: string;
  description: string | null;
  c_secure_url: string | null;
  file_hash: string;
  perceptual_hash: string;
  evidence_hash: string | null;
  chain: string | null;
  tx_hash: string | null;
  status: string;
  created_at: string;
  owner: ArtworkOwner;
}

interface MetadataPanelProps {
  artwork: ArtworkData;
}

export const MetadataPanel = memo(function MetadataPanel({ artwork }: MetadataPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Artwork Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="font-medium">{artwork.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Artist</p>
            <p className="font-medium">
              {artwork.owner.first_name} {artwork.owner.last_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="font-medium">@{artwork.owner.username}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uploaded</p>
            <p className="font-medium">{formatTimeAgo(artwork.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{artwork.status.replace(/_/g, " ")}</p>
          </div>
          {artwork.chain && (
            <div>
              <p className="text-xs text-muted-foreground">Blockchain</p>
              <p className="font-medium capitalize">{artwork.chain}</p>
            </div>
          )}
        </div>

        {artwork.description && (
          <div>
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {artwork.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Hashes */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Hash className="h-3 w-3" /> Hashes
          </p>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-muted-foreground">File Hash</p>
              <p className="font-mono text-[10px] break-all text-muted-foreground">
                {artwork.file_hash.substring(0, 32)}...
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Perceptual Hash</p>
              <p className="font-mono text-[10px] break-all text-muted-foreground">
                {artwork.perceptual_hash.substring(0, 32)}...
              </p>
            </div>
            {artwork.evidence_hash && (
              <div>
                <p className="text-[10px] text-muted-foreground">Evidence Hash</p>
                <p className="font-mono text-[10px] break-all text-muted-foreground">
                  {artwork.evidence_hash.substring(0, 32)}...
                </p>
              </div>
            )}
          </div>
        </div>

        {artwork.tx_hash && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Transaction</p>
              <p className="font-mono text-xs break-all text-muted-foreground">
                {artwork.tx_hash.substring(0, 20)}...
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
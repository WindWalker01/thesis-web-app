"use client";

import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/client-utils";
import { toast } from "sonner";
import type { ArtworkDetail } from "../types";

interface ArtworkMetadataProps {
  artwork: ArtworkDetail;
}

function CopyField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs font-mono">
          {value}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function ArtworkMetadata({ artwork }: ArtworkMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <CopyField label="Artwork ID" value={artwork.id} />
        <CopyField label="Owner ID" value={artwork.owner.id} />
        <Separator />
        <CopyField label="Cloudinary Asset ID" value={artwork.c_asset_id} />
        <CopyField label="Cloudinary Secure URL" value={artwork.c_secure_url} />
        <Separator />
        <CopyField label="File Hash" value={artwork.file_hash} />
        <CopyField label="Perceptual Hash" value={artwork.perceptual_hash} />
        <CopyField label="Author ID Hash" value={artwork.author_id_hash} />
        <CopyField label="Evidence Hash" value={artwork.evidence_hash} />
        <Separator />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Created At</p>
            <p className="font-medium text-sm">{formatDate(artwork.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated At</p>
            <p className="font-medium text-sm">{formatDate(artwork.updated_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
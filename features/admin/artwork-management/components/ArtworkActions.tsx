"use client";

import { MoreHorizontal, ExternalLink, Copy, Archive, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ArtworkActionsProps {
  artworkId: string;
  txHash?: string | null;
  workId?: string | null;
  onViewDetail: () => void;
  onArchive?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
}

export function ArtworkActions({
  artworkId,
  txHash,
  workId,
  onViewDetail,
  onArchive,
  onHide,
  onDelete,
}: ArtworkActionsProps) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Artwork actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Artwork Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewDetail}>
          <ExternalLink className="mr-2 h-4 w-4" /> View Full Page
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyToClipboard(artworkId, "Artwork ID")}>
          <Copy className="mr-2 h-4 w-4" /> Copy Artwork ID
        </DropdownMenuItem>
        {txHash && (
          <DropdownMenuItem onClick={() => copyToClipboard(txHash, "Transaction hash")}>
            <Copy className="mr-2 h-4 w-4" /> Copy Transaction Hash
          </DropdownMenuItem>
        )}
        {workId && (
          <DropdownMenuItem onClick={() => copyToClipboard(workId, "Work ID")}>
            <Copy className="mr-2 h-4 w-4" /> Copy Work ID
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onArchive && (
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" /> Archive
          </DropdownMenuItem>
        )}
        {onHide && (
          <DropdownMenuItem onClick={onHide}>
            <EyeOff className="mr-2 h-4 w-4" /> Hide
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
"use client";

import { ExternalLink, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/client-utils";
import type { ArtworkDetail } from "../types";

interface BlockchainCardProps {
  artwork: ArtworkDetail;
}

export function BlockchainCard({ artwork }: BlockchainCardProps) {
  const { chain, tx_hash, block_number, work_id, status } = artwork;

  const isRegistered = !!(tx_hash && status === "active");
  const isPending = status === "pending_blockchain";
  const isFailed = status === "rejected";

  const explorerUrl = chain && tx_hash
    ? chain === "polygon_amoy"
      ? `https://amoy.polygonscan.com/tx/${tx_hash}`
      : `https://polygonscan.com/tx/${tx_hash}`
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Blockchain</CardTitle>
        {isRegistered && (
          <Badge variant="outline" className="bg-green-100 text-green-600 text-[10px]">
            Registered
          </Badge>
        )}
        {isPending && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-600 text-[10px]">
            Pending
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isRegistered ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Chain</p>
                <p className="font-medium">{chain ?? "Polygon Amoy"}</p>
              </div>
              {block_number && (
                <div>
                  <p className="text-xs text-muted-foreground">Block Number</p>
                  <p className="font-medium">#{block_number}</p>
                </div>
              )}
            </div>
            {work_id && (
              <div>
                <p className="text-xs text-muted-foreground">Work ID</p>
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {work_id}
                </code>
              </div>
            )}
            {tx_hash && (
              <div>
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded block truncate">
                  {tx_hash}
                </code>
              </div>
            )}
            {explorerUrl && (
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" /> View on Explorer
                </a>
              </Button>
            )}
          </>
        ) : isPending ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
            <p className="text-sm text-muted-foreground">Awaiting blockchain registration...</p>
          </div>
        ) : isFailed ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <XCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm font-medium text-red-600">Registration Failed</p>
            <p className="text-xs text-muted-foreground">
              The artwork was rejected during blockchain verification.
            </p>
            <Button variant="outline" size="sm" disabled>
              Retry Registration
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">Not registered on blockchain</p>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground">
          {artwork.created_at && <p>Registered: {formatDate(artwork.created_at)}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
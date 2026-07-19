"use client";

import { useState } from "react";
import { ExternalLink, Loader2, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/client-utils";
import { toast } from "sonner";
import type { ArtworkDetail } from "../types";

interface BlockchainCardProps {
  artwork: ArtworkDetail;
  onRefresh?: () => void;
}

export function BlockchainCard({ artwork, onRefresh }: BlockchainCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const { chain, tx_hash, block_number, work_id, status } = artwork;

  const currentStatus = status as string;
  const isRegistered = !!(tx_hash && currentStatus === "active");
  const isPending = currentStatus === "pending_blockchain";
  const isFailed = currentStatus === "blockchain_failed";
  const canRetry = isPending || isFailed;

  const explorerUrl = chain && tx_hash
    ? chain === "polygon_amoy"
      ? `https://amoy.polygonscan.com/tx/${tx_hash}`
      : `https://polygonscan.com/tx/${tx_hash}`
    : null;

  const handleRetryRegistration = async () => {
    setIsRegistering(true);
    try {
      const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register_blockchain" }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to register artwork on blockchain");
    } finally {
      setIsRegistering(false);
    }
  };

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
        {isFailed && (
          <Badge variant="outline" className="bg-red-100 text-red-600 text-[10px]">
            Failed
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
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
            <p className="text-sm text-muted-foreground">Awaiting blockchain registration...</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryRegistration}
              disabled={isRegistering}
              className="gap-2"
            >
              {isRegistering ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              {isRegistering ? "Registering..." : "Register Now"}
            </Button>
          </div>
        ) : isFailed ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <XCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm font-medium text-red-600">Registration Failed</p>
            <p className="text-xs text-muted-foreground">
              The blockchain registration encountered an error. You can retry.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryRegistration}
              disabled={isRegistering}
              className="gap-2"
            >
              {isRegistering ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              {isRegistering ? "Registering..." : "Retry Registration"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-muted-foreground">Not registered on blockchain</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryRegistration}
              disabled={isRegistering}
              className="gap-2"
            >
              {isRegistering ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              {isRegistering ? "Registering..." : "Register on Blockchain"}
            </Button>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground">
          {artwork.created_at && <p>Registered: {formatDate(artwork.created_at)}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

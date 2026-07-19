"use client";

import { useState, useCallback } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/client-utils";
import { ArtworkPreview } from "./ArtworkPreview";
import { ArtworkMetadata } from "./ArtworkMetadata";
import { BlockchainCard } from "./BlockchainCard";
import { SimilarityCard } from "./SimilarityCard";
import { ManualReviewCard } from "./ManualReviewCard";
import { TimelineCard } from "./TimelineCard";
import type { ArtworkDetail } from "../types";

type DrawerTab = "overview" | "metadata" | "blockchain" | "similarity" | "review" | "reports" | "timeline" | "notes";

interface ArtworkDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: ArtworkDetail | undefined;
  isLoading: boolean;
  error: string | null;
  onAction: (action: string, reason?: string) => Promise<void>;
  onRefresh: () => void;
}

export function ArtworkDrawer({
  open,
  onOpenChange,
  detail,
  isLoading,
  error,
  onAction,
  onRefresh,
}: ArtworkDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  const handleAction = useCallback(async (action: string, reason?: string) => {
    await onAction(action, reason);
  }, [onAction]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex flex-col p-0 gap-0" style={{ maxWidth: "80vw", maxHeight: "90vh" }}>
        {isLoading ? (
          <div className="space-y-4 p-6">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="aspect-video animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : error || !detail ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
            <p className="text-lg font-medium">Failed to load artwork</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" variant="outline" onClick={onRefresh}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-lg truncate">
                      {detail.title}
                    </DialogTitle>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {formatDate(detail.created_at)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Artwork ID: {detail.id.substring(0, 8)}...
                  </p>
                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DrawerTab)}>
                <TabsList className="w-full justify-start flex-wrap">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="metadata" className="text-xs">Metadata</TabsTrigger>
                  <TabsTrigger value="blockchain" className="text-xs">Blockchain</TabsTrigger>
                  <TabsTrigger value="similarity" className="text-xs">Similarity</TabsTrigger>
                  <TabsTrigger value="review" className="text-xs">Review</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 pt-4">
                  <ArtworkPreview artwork={detail} />
                  {detail.reports.length > 0 && (
                    <div className="rounded-xl border bg-card p-4">
                      <h3 className="text-sm font-medium mb-3">
                        Reports ({detail.reports.length})
                      </h3>
                      <div className="space-y-2">
                        {detail.reports.slice(0, 5).map((report) => (
                          <div key={report.id} className="flex items-center justify-between text-sm">
                            <span className="truncate flex-1">{report.title}</span>
                            <Badge variant="outline" className="text-[10px] ml-2">
                              {report.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {detail.notifications.length > 0 && (
                    <div className="rounded-xl border bg-card p-4">
                      <h3 className="text-sm font-medium mb-3">
                        Notifications ({detail.notifications.length})
                      </h3>
                      <div className="space-y-2">
                        {detail.notifications.slice(0, 5).map((notif) => (
                          <div key={notif.id} className="text-sm">
                            <p className="font-medium">{notif.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="metadata" className="pt-4">
                  <ArtworkMetadata artwork={detail} />
                </TabsContent>

                <TabsContent value="blockchain" className="pt-4">
                  <BlockchainCard artwork={detail} onRefresh={onRefresh} />
                </TabsContent>

                <TabsContent value="similarity" className="pt-4">
                  <SimilarityCard scan={detail.scan} />
                </TabsContent>

                <TabsContent value="review" className="pt-4">
                  <ManualReviewCard artwork={detail} onAction={handleAction} />
                </TabsContent>

                <TabsContent value="timeline" className="pt-4">
                  <TimelineCard artwork={detail} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
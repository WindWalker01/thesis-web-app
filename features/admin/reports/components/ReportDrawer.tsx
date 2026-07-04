"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  User,
  ChevronDown,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/client-utils";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { EvidenceViewer } from "./EvidenceViewer";
import { InvestigationTimeline } from "./InvestigationTimeline";
import { AdminNotes } from "./AdminNotes";
import { ResolutionCard } from "./ResolutionCard";
import type {
  AdminReportDetail,
  ReportStatus,
} from "@/features/reports/types";
import { REPORT_TYPE_LABELS } from "@/features/reports/types";

interface ReportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: AdminReportDetail | undefined;
  isLoading: boolean;
  error: string | null;
  onUpdateStatus: (status: string, notes?: string) => Promise<void>;
  onRecordDecision: (decision: string, summary: string) => Promise<void>;
  onAddComment: (message: string) => Promise<void>;
  onRequestEvidence: (message: string) => Promise<void>;
  isUpdatingStatus: boolean;
  isRecordingDecision: boolean;
  isSendingComment: boolean;
  isRequestingEvidence: boolean;
  onRefresh: () => void;
}

type DrawerTab = "overview" | "evidence" | "timeline" | "notes" | "resolution";

export function ReportDrawer({
  open,
  onOpenChange,
  detail,
  isLoading,
  error,
  onUpdateStatus,
  onRecordDecision,
  onAddComment,
  onRequestEvidence,
  isUpdatingStatus,
  isRecordingDecision,
  isSendingComment,
  isRequestingEvidence,
  onRefresh,
}: ReportDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  const reporterName = detail
    ? `${detail.reporter.first_name} ${detail.reporter.last_name ?? ""}`
    : "";

  const reporterInitial = detail?.reporter.first_name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : error || !detail ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
            <p className="text-lg font-medium">Failed to load report</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" variant="outline" onClick={onRefresh}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-lg truncate">
                      {detail.report.title}
                    </SheetTitle>
                    <ReportStatusBadge status={detail.report.status as ReportStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Report ID: {detail.report.id.substring(0, 8)}...
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 shrink-0 ml-2">
                      Actions <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Report Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setActiveTab("resolution")}>
                      Resolution Options
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onRefresh}>
                      Refresh
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DrawerTab)}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="evidence" className="text-xs">Evidence</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                <TabsTrigger value="resolution" className="text-xs">Resolution</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                {/* General Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Report Type</p>
                        <p className="font-medium">
                          {REPORT_TYPE_LABELS[detail.report.report_type] ?? detail.report.report_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="font-medium">{formatDate(detail.report.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Resolved At</p>
                        <p className="font-medium">
                          {detail.report.resolved_at ? formatDate(detail.report.resolved_at) : "—"}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {detail.report.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Reporter Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Reporter Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                        {detail.reporter.c_profile_image ? (
                          <Image
                            src={detail.reporter.c_profile_image}
                            alt={reporterName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{reporterName}</p>
                        <p className="text-xs text-muted-foreground">@{detail.reporter.username}</p>
                      </div>
                    </div>
                    {detail.reporter.email && (
                      <p className="mt-2 text-xs text-muted-foreground">{detail.reporter.email}</p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      Member since {formatDate(detail.reporter.created_at)}
                    </p>
                  </CardContent>
                </Card>

                {/* Reported Artwork */}
                {detail.reported_art_post?.registered_arts && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Reported Artwork</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        {detail.reported_art_post.registered_arts.c_secure_url && (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={detail.reported_art_post.registered_arts.c_secure_url}
                              alt={detail.reported_art_post.registered_arts.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-medium">
                            {detail.reported_art_post.registered_arts.title}
                          </p>
                          {detail.reported_art_post.registered_arts.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {detail.reported_art_post.registered_arts.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px]">
                              {detail.reported_art_post.registered_arts.status}
                            </Badge>
                            <span>{formatDate(detail.reported_art_post.registered_arts.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="evidence" className="pt-4">
                <EvidenceViewer
                  evidence={detail.evidence}
                  isLoading={false}
                />
              </TabsContent>

              <TabsContent value="timeline" className="pt-4">
                <InvestigationTimeline
                  actions={detail.actions}
                  isLoading={false}
                />
              </TabsContent>

              <TabsContent value="notes" className="pt-4">
                <AdminNotes
                  comments={detail.comments}
                  isLoading={false}
                  onSendComment={onAddComment}
                  isSending={isSendingComment}
                />
              </TabsContent>

              <TabsContent value="resolution" className="pt-4">
                <ResolutionCard
                  reportId={detail.report.id}
                  currentStatus={detail.report.status as ReportStatus}
                  decision={detail.decision}
                  onUpdateStatus={onUpdateStatus}
                  onRecordDecision={onRecordDecision}
                  onRequestEvidence={onRequestEvidence}
                  isUpdatingStatus={isUpdatingStatus}
                  isRecordingDecision={isRecordingDecision}
                  isRequestingEvidence={isRequestingEvidence}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
"use client";

import { memo } from "react";
import {
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReviewStatusBadge } from "../ReviewStatusBadge";
import type { ReviewStatus } from "../../types";

interface Reviewer {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
}

interface ReviewActionsPanelProps {
  status: ReviewStatus;
  reviewer: Reviewer | null;
  isAssigning: boolean;
  isDecided: boolean;
  decision_reason: string | null;
  onAssignToMe: () => void;
  onUnassign: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
}

const ACTION_HELP_TEXT: Record<string, string> = {
  approve: "Makes the artwork publicly available and initiates blockchain registration.",
  reject: "Removes the artwork from the verification process and notifies the artist.",
  request_info: "Sends a notification requesting additional evidence from the artist.",
  assign: "Assign yourself to review this artwork.",
  unassign: "Release this artwork back to the review queue.",
};

export const ReviewActionsPanel = memo(function ReviewActionsPanel({
  status,
  reviewer,
  isAssigning,
  isDecided,
  decision_reason,
  onAssignToMe,
  onUnassign,
  onApprove,
  onReject,
  onRequestInfo,
}: ReviewActionsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Review Panel
        </CardTitle>
        <CardDescription className="text-xs">
          Review this artwork and make a moderation decision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <ReviewStatusBadge status={status} />
        </div>

        {/* Reviewer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reviewer</span>
          <span className="text-sm font-medium">
            {reviewer
              ? `${reviewer.first_name} ${reviewer.last_name}`
              : "Unassigned"}
          </span>
        </div>

        {!isDecided && (
          <div className="space-y-2">
            {reviewer ? (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onUnassign}
                  disabled={isAssigning}
                >
                  {isAssigning ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : null}
                  Unassign Me
                </Button>
                <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                  {ACTION_HELP_TEXT.unassign}
                </p>
              </div>
            ) : (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onAssignToMe}
                  disabled={isAssigning}
                >
                  {isAssigning ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <User className="mr-2 h-3 w-3" />
                  )}
                  Assign to Me
                </Button>
                <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                  {ACTION_HELP_TEXT.assign}
                </p>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Action Buttons with Helper Text */}
        {!isDecided ? (
          <div className="space-y-3">
            {/* Approve */}
            <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/10 p-3">
              <Button
                className="w-full gap-2"
                onClick={onApprove}
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Registration
              </Button>
              <p className="mt-1.5 text-[10px] leading-relaxed text-green-700 dark:text-green-400">
                <Info className="inline h-3 w-3 mr-0.5 align-text-bottom" />
                {ACTION_HELP_TEXT.approve}
              </p>
            </div>

            {/* Reject */}
            <div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/10 p-3">
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={onReject}
                size="sm"
              >
                <XCircle className="h-4 w-4" />
                Reject Registration
              </Button>
              <p className="mt-1.5 text-[10px] leading-relaxed text-red-700 dark:text-red-400">
                <Info className="inline h-3 w-3 mr-0.5 align-text-bottom" />
                {ACTION_HELP_TEXT.reject}
              </p>
            </div>

            {/* Request Info */}
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/10 p-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={onRequestInfo}
                size="sm"
              >
                <HelpCircle className="h-4 w-4" />
                Request More Information
              </Button>
              <p className="mt-1.5 text-[10px] leading-relaxed text-purple-700 dark:text-purple-400">
                <Info className="inline h-3 w-3 mr-0.5 align-text-bottom" />
                {ACTION_HELP_TEXT.request_info}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-3 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {status === "approved"
                ? "Approved"
                : status === "rejected"
                  ? "Rejected"
                  : "Decision Made"}
            </p>
            {decision_reason && (
              <p className="text-xs text-muted-foreground mt-1">
                {decision_reason}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
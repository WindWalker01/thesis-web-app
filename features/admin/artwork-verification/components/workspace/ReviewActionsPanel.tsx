"use client";

import { memo } from "react";
import {
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            ) : (
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
            )}
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        {!isDecided ? (
          <div className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={onApprove}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Registration
            </Button>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4" />
              Reject Registration
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onRequestInfo}
            >
              <HelpCircle className="h-4 w-4" />
              Request More Information
            </Button>
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
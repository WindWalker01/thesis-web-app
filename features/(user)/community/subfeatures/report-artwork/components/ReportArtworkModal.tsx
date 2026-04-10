"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/client-utils";
import { useReportArtworkModal } from "../hooks/useReportArtworkModal";
import {
  REPORT_REASONS,
  type ReportPayload,
  type ReportReason,
} from "../types";

type ReportArtworkModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  username?: string;
  postId?: string;
  onSubmit: (payload: ReportPayload) => Promise<{ success: boolean; message: string }>;
};

export function ReportArtworkModal({
  open,
  onOpenChange,
  title,
  username,
  postId,
  onSubmit,
}: ReportArtworkModalProps) {
  const {
    formId,
    reason,
    setReason,
    details,
    setDetails,
    context,
    setContext,
    error,
    needsContext,
    isSubmitting,
    handleSubmit,
  } = useReportArtworkModal({ open, onOpenChange, onSubmit, postId });

  const contextConfig =
    reason === "copyright"
      ? {
        label: "Original source / proof",
        placeholder:
          "Paste the original link (e.g. Instagram/ArtStation), or explain why it’s stolen...",
      }
      : reason === "other"
        ? {
          label: "Please describe",
          placeholder: "Tell us what’s wrong with this artwork/post...",
        }
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl max-h-[85vh] flex flex-col bg-card">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg">Report artwork</DialogTitle>
          <DialogDescription className="text-sm">
            Help keep the community safe. Reports are reviewed by moderators/admins.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="custom-scrollbar flex-1 min-h-0 space-y-4 overflow-y-auto pr-2">
            {(title || username) && (
              <div className="rounded-xl border p-3">
                {title ? (
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </div>
                ) : null}

                {username ? (
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Posted by u/{username}
                  </div>
                ) : null}
              </div>
            )}

            <fieldset className="space-y-2">
              <Label className="text-sm">
                Reason <span className="text-red-600">*</span>
              </Label>

              <RadioGroup
                value={reason}
                onValueChange={(value) => setReason(value as ReportReason)}
                className="space-y-2"
                aria-label="Report reason"
              >
                {REPORT_REASONS.map((r) => {
                  const selected = reason === r.value;

                  return (
                    <Label
                      key={r.value}
                      htmlFor={`reason-${r.value}`}
                      className={cn(
                        "flex cursor-pointer select-none items-start gap-3 rounded-xl border p-3",
                        "border-border",
                        "transition-colors duration-200 ease-out",
                        selected && "border-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={r.value}
                        id={`reason-${r.value}`}
                        className="mt-1"
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {r.label}
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </fieldset>

            {contextConfig ? (
              <div className="space-y-2">
                <Label htmlFor="context" className="text-sm">
                  {contextConfig.label} <span className="text-red-600">*</span>
                </Label>

                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={contextConfig.placeholder}
                  className="min-h-24 rounded-xl"
                  required={needsContext}
                  aria-invalid={Boolean(error) && needsContext && !context.trim()}
                  aria-describedby={error ? "report-error" : undefined}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="details" className="text-sm">
                Additional details (optional)
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any extra context that can help reviewers..."
                className="min-h-24 rounded-xl"
              />
            </div>

            {error ? (
              <div id="report-error" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 shrink-0 pt-3">
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => onOpenChange(false)}
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
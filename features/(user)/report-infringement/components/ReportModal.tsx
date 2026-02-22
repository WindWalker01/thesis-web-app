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
import { useReportModal } from "../hooks/useReportModal";
import { REPORT_REASONS, type ReportReason, type ReportPayload } from "../types";

/**
 * Props for ReportModal (UI component).
 * - open / onOpenChange: controlled dialog state (parent decides when to show/hide)
 * - title / username: info about the post being reported (optional display)
 * - onSubmit: callback to send the report payload to backend / API
 * - postId: identify which post is being reported
 */
type ReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  username?: string;
  onSubmit: (payload: ReportPayload) => void;
  postId?: string;
};

export function ReportModal({
  open,
  onOpenChange,
  title,
  username,
  onSubmit,
  postId,
}: ReportModalProps) {
  /**
   * Custom hook encapsulates all "business logic" for reporting:
   * - current reason/details/context inputs
   * - validation rules (when context is required)
   * - submit state + error handling
   *
   * This keeps the component mostly focused on rendering UI.
   */
  const {
    formId, // unique id to bind <form> actions, avoids collisions if multiple modals exist
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
  } = useReportModal({ open, onOpenChange, onSubmit, postId });

  /**
   * Decide if we need to show an extra "context" Textarea and what it should say.
   * Only certain reasons require a mandatory explanation/proof:
   * - copyright: must include original link / proof
   * - other: must describe what the issue is
   */
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
    /**
     * Dialog is controlled by parent via open + onOpenChange.
     * This avoids hidden internal state bugs (single source of truth).
     */
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent: main container of the modal */}
      <DialogContent className="sm:max-w-130 rounded-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0e1113]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg">Report artwork</DialogTitle>
          <DialogDescription className="text-sm">
            {/* Clear guidance for users: reports go to moderators/admins */}
            Help keep the community safe. Reports are reviewed by moderators/admins.
          </DialogDescription>
        </DialogHeader>

        {/* Form handles Enter-to-submit + allows native validation patterns */}
        <form id={formId} onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable area so footer buttons stay visible even on small screens */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar min-h-0">
            {/* Post summary card: only render if we have title or username */}
            {(title || username) && (
              <div className="rounded-xl border border-[#EDEFF1] dark:border-[#343536] p-3 bg-[#f6f8f9] dark:bg-[#181c1f]">
                {title && (
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {/* Display the post title being reported */}
                    {title}
                  </div>
                )}
                {username && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {/* Display author/owner of the post */}
                    Posted by u/{username}
                  </div>
                )}
              </div>
            )}

            {/* Reason selection: required field */}
            <fieldset className="space-y-2">
              <Label className="text-sm">
                Reason <span className="text-red-600">*</span>
              </Label>

              <RadioGroup
                value={reason}
                // RadioGroup gives string, but our state expects ReportReason type
                onValueChange={(v) => setReason(v as ReportReason)}
                className="space-y-2"
                aria-label="Report reason"
              >
                {REPORT_REASONS.map((r) => {
                  // Track whether this option is currently selected (for styling)
                  const selected = reason === r.value;

                  return (
                    /**
                     * We wrap each radio item inside a Label to make the whole "card"
                     * clickable (better UX on mobile).
                     */
                    <Label
                      key={r.value}
                      htmlFor={`reason-${r.value}`}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 transition cursor-pointer select-none",
                        "hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f]",
                        selected
                          ? "border-gray-400 dark:border-gray-500 bg-[#f6f8f9] dark:bg-[#181c1f]"
                          : "border-[#EDEFF1] dark:border-[#343536]"
                      )}
                    >
                      {/* Actual radio control (small circle) */}
                      <RadioGroupItem value={r.value} id={`reason-${r.value}`} className="mt-1" />

                      {/* Human-friendly label text */}
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {r.label}
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </fieldset>

            {/* Conditionally render the "context/proof" textarea when required */}
            {contextConfig && (
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
                  // required ensures HTML-level validation + accessibility expectations
                  required
                  // Mark as invalid if we have an error AND context is blank
                  aria-invalid={Boolean(error) && !context.trim()}
                  // Link the input to the error message for screen readers
                  aria-describedby={error ? "report-error" : undefined}
                />
              </div>
            )}

            {/* Optional free-text details for more info (not required) */}
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

            {/* Error message region (only shows when validation fails) */}
            {error && (
              <div id="report-error" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Footer actions fixed below scrollable content */}
          <DialogFooter className="gap-2 shrink-0 pt-3">
            {/* Cancel button only closes modal; it must NOT submit form */}
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => onOpenChange(false)}
              type="button"
              disabled={isSubmitting} // prevent closing while submitting (avoids double actions)
            >
              Cancel
            </Button>

            {/* Submit triggers form submit -> handleSubmit from hook */}
            <Button
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              type="submit"
              disabled={isSubmitting} // prevent double submit
            >
              {/* UX feedback while waiting for onSubmit to resolve */}
              {isSubmitting ? "Submitting..." : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
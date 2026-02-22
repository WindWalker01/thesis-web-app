// This hook uses React state/effects, so it must run on the client.
"use client";

import * as React from "react";
import { ReportPayload, ReportReason } from "../types";

/**
 * Arguments for useReportModal hook.
 * - open/onOpenChange: allows the hook to reset state when modal closes,
 *   and also close the modal after successful submit.
 * - onSubmit: async callback to send the report payload (API call is usually done here or inside parent)
 * - postId: optional identifier to include in payload
 */
type UseReportModalArgs = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ReportPayload) => void;
  postId?: string;
};

export function useReportModal({ open, onOpenChange, onSubmit, postId }: UseReportModalArgs) {
  /**
   * React.useId creates a stable unique id for this component instance.
   * Useful if multiple modals can exist, preventing duplicate form IDs.
   */
  const formId = React.useId();

  // Controlled form state
  const [reason, setReason] = React.useState<ReportReason>("copyright");
  const [details, setDetails] = React.useState("");
  const [context, setContext] = React.useState("");

  // UI state
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  /**
   * Some reasons require extra "context/proof".
   * This keeps the rule in one place so both UI + validation use the same logic.
   */
  const needsContext = reason === "copyright" || reason === "other";

  /**
   * When modal closes, reset fields so reopening starts clean.
   * This avoids stale values from previous report attempts.
   */
  React.useEffect(() => {
    if (!open) {
      setReason("copyright");
      setDetails("");
      setContext("");
      setError(null);
    }
  }, [open]);

  /**
   * If user changes any field after an error, clear error immediately.
   * This avoids "sticky" error UI once the user is already fixing it.
   */
  React.useEffect(() => {
    if (error) setError(null);
  }, [reason, details, context]);

  /**
   * Form validation rules.
   * Returns:
   * - a user-friendly error message if invalid
   * - null if valid
   */
  function validate(): string | null {
    // If context is required, it must not be blank/whitespace only.
    if (needsContext && !context.trim()) {
      return reason === "copyright"
        ? "Please provide the original source / link or explain why you believe it’s stolen."
        : "Please describe the issue.";
    }
    return null;
  }

  /**
   * Submit handler for <form onSubmit>.
   * - Prevent default browser refresh
   * - Validate inputs
   * - Lock UI while submitting (isSubmitting)
   * - Call onSubmit with normalized payload (trim strings, omit empty optional fields)
   * - Close modal on success
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const message = validate();
    if (message) {
      setError(message);
      return; // stop submission if invalid
    }

    setIsSubmitting(true);
    try {
      // Build payload carefully:
      // - trim details/context
      // - only include optional fields if they have content
      await onSubmit({
        postId,
        reason,
        details: details.trim() ? details.trim() : undefined,
        context: needsContext && context.trim() ? context.trim() : undefined,
      });

      // Close modal after successful submit
      onOpenChange(false);
    } finally {
      // finally ensures we always unlock UI even if onSubmit throws
      setIsSubmitting(false);
    }
  }

  // Hook returns everything the UI layer needs (state + actions)
  return {
    formId,
    reason,
    setReason,
    details,
    setDetails,
    context,
    setContext,
    error,
    needsContext,
    handleSubmit,
    isSubmitting,
  };
}
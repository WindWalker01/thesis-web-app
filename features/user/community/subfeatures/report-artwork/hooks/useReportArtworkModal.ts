"use client";

import { useId, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  reportArtworkSchema,
  type ReportArtworkInput,
  type ReportReason,
} from "../schemas/report-artwork-schema";

type UseReportModalArgs = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ReportArtworkInput) => Promise<{ success: boolean; message: string }>;
  postId?: string;
};

export function useReportArtworkModal({
  open,
  onOpenChange,
  onSubmit,
  postId,
}: UseReportModalArgs) {
  const formId = useId();

  const [reason, setReasonState] = useState<ReportReason>("copyright");
  const [details, setDetailsState] = useState("");
  const [context, setContextState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  const needsContext = reason === "copyright" || reason === "other";

  const { mutateAsync, isPending, reset } = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    },
  });

  // Reset form fields when the modal opens (adjust during render, not in an effect).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setReasonState("copyright");
      setDetailsState("");
      setContextState("");
      setError(null);
    }
  }

  // Clear mutation cache when opening; avoid setState in this effect.
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const setReason = (value: ReportReason) => {
    setReasonState(value);
    setError(null);
  };

  const setDetails = (value: string) => {
    setDetailsState(value);
    setError(null);
  };

  const setContext = (value: string) => {
    setContextState(value);
    setError(null);
  };

  function getPayload(): ReportArtworkInput {
    return {
      postId: postId ?? "",
      reason,
      details: details.trim(),
      context: context.trim(),
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = getPayload();
    const parsed = reportArtworkSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setError(firstIssue?.message || "Please check the form and try again.");
      return;
    }

    setError(null);
    await mutateAsync(parsed.data);
  }

  return {
    formId,
    reason,
    setReason,
    details,
    setDetails,
    context,
    setContext,
    error,
    setError,
    needsContext,
    handleSubmit,
    isSubmitting: isPending,
  };
}

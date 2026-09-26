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

  const [reason, setReason] = useState<ReportReason>("copyright");
  const [details, setDetails] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!open) {
      setReason("copyright");
      setDetails("");
      setContext("");
      setError(null);
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    if (error) setError(null);
  }, [reason, details, context]);

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
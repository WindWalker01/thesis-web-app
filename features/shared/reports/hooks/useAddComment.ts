"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCommentSchema } from "@/features/reports/schemas/report-schemas";
import { reportDetailKeys } from "./useReportDetail";
import type { ReportComment } from "@/features/reports/types";

type AddCommentInput = {
  reportId: string;
  message: string;
};

async function addComment({
  reportId,
  message,
}: AddCommentInput): Promise<ReportComment> {
  const validation = addCommentSchema.safeParse({ message });
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message ?? "Invalid input");
  }

  const res = await fetch(`/api/reports/${reportId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: validation.data.message }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? "Failed to add comment");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json?.error?.message ?? "Failed to add comment");
  }

  return json.data as ReportComment;
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addComment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportDetailKeys.byId(variables.reportId),
      });
    },
  });
}
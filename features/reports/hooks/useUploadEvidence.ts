"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportDetailKeys } from "./useReportDetail";
import type { ReportEvidence } from "@/features/reports/types";

type UploadEvidenceInput = {
  reportId: string;
  file: File;
  description?: string;
};

async function uploadEvidence({
  reportId,
  file,
  description,
}: UploadEvidenceInput): Promise<ReportEvidence> {
  const formData = new FormData();
  formData.append("file", file);
  if (description) {
    formData.append("description", description);
  }

  const res = await fetch(`/api/reports/${reportId}/evidence`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? "Failed to upload evidence");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json?.error?.message ?? "Failed to upload evidence");
  }

  return json.data as ReportEvidence;
}

export function useUploadEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadEvidence,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportDetailKeys.byId(variables.reportId),
      });
    },
  });
}
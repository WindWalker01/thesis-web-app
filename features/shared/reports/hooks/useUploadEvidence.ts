"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportDetailKeys } from "./useReportDetail";
import { uploadReportEvidence } from "@/features/reports/lib/upload-report-evidence";

export function useUploadEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadReportEvidence,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportDetailKeys.byId(variables.reportId),
      });
    },
  });
}
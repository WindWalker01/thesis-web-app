"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportDetailKeys } from "./useReportDetail";
import { userReportsKeys } from "./useUserReports";

type AppealInput = {
  reportId: string;
  reason: string;
};

/**
 * Placeholder mutation for submitting an appeal.
 * The backend endpoint is not yet implemented; this prepares the UI for future integration.
 * Currently simulates a successful appeal after a short delay.
 */
async function submitAppeal({ reportId, reason }: AppealInput): Promise<{ success: true }> {
  // TODO: Replace with actual API call when backend is ready
  // Expected endpoint: POST /api/reports/${reportId}/appeal
  // Body: { reason: string }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 800);
  });
}

export function useAppealReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAppeal,
    onSuccess: (_data, variables) => {
      // Invalidate both detail and list queries to reflect changes
      queryClient.invalidateQueries({
        queryKey: reportDetailKeys.byId(variables.reportId),
      });
      queryClient.invalidateQueries({
        queryKey: userReportsKeys.all(),
      });
    },
  });
}
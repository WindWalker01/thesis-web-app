"use client";

import { cn } from "@/lib/client-utils";

interface StatusDescriptionProps {
  status: string;
}

const STATUS_EXPLANATIONS: Record<string, { title: string; description: string }> = {
  pending_review: {
    title: "Pending for Review",
    description:
      "Reports submitted by users that have not yet been investigated.",
  },
  under_review: {
    title: "Under Investigation",
    description:
      "Reports currently being reviewed by administrators.",
  },
  resolved: {
    title: "Resolved",
    description:
      "Reports that have already been reviewed and resolved.",
  },
};

export function ReportsStatusDescription({ status }: StatusDescriptionProps) {
  const info = STATUS_EXPLANATIONS[status];
  if (!info) return null;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm",
        status === "pending_review" && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20",
        status === "under_review" && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20",
        status === "resolved" && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
      )}
    >
      <p className="font-medium">{info.title}</p>
      <p className="mt-0.5 text-muted-foreground">{info.description}</p>
    </div>
  );
}
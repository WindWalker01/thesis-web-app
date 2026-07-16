"use client";

import { cn } from "@/lib/client-utils";
import type { ReviewStatus } from "../types";

interface StatusDescriptionProps {
  status: string;
}

const STATUS_EXPLANATIONS: Record<string, { title: string; description: string }> = {
  pending: {
    title: "Awaiting Review",
    description:
      "Artworks that require administrator verification because the automatic verification process could not confidently determine authenticity.",
  },
  under_review: {
    title: "Being Reviewed",
    description:
      "Artworks that an administrator has currently assigned to themselves for manual verification.",
  },
  approved: {
    title: "Approved",
    description:
      "Artworks that have successfully passed manual verification and are publicly visible.",
  },
  needs_info: {
    title: "More Information Requested",
    description:
      "Waiting for the artist to submit additional documents or evidence before verification can continue.",
  },
  rejected: {
    title: "Rejected",
    description:
      "Artworks that failed verification or violated submission requirements.",
  },
};

export function ReviewStatusDescription({ status }: StatusDescriptionProps) {
  const info = STATUS_EXPLANATIONS[status];
  if (!info) return null;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm",
        status === "pending" && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20",
        status === "under_review" && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20",
        status === "approved" && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20",
        status === "needs_info" && "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20",
        status === "rejected" && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
      )}
    >
      <p className="font-medium">{info.title}</p>
      <p className="mt-0.5 text-muted-foreground">{info.description}</p>
    </div>
  );
}
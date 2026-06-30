"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title = "No reports submitted yet",
  description = "You haven't submitted any infringement reports. If you believe your work has been used without permission, you can file a report.",
  actionLabel = "Browse Gallery",
  actionHref = "/art",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Illustration */}
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-16 w-16 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
"use client";

import { FileText, SearchX, ImageIcon, MessageSquare, UserX, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/client-utils";

interface EmptyReportsProps {
  variant?: "no-reports" | "no-results" | "no-evidence" | "no-comments" | "no-notes" | "no-admin" | "all-resolved";
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const VARIANTS = {
  "no-reports": {
    icon: FileText,
    title: "No reports found",
    description: "There are no infringement reports to review at this time.",
  },
  "all-resolved": {
    icon: ShieldCheck,
    title: "All Caught Up",
    description: "There are no unresolved reports at the moment. New reports will appear here when submitted.",
  },
  "no-results": {
    icon: SearchX,
    title: "No matching reports",
    description: "No reports match your current search or filter criteria.",
  },
  "no-evidence": {
    icon: ImageIcon,
    title: "No evidence uploaded",
    description: "No evidence has been submitted for this report yet.",
  },
  "no-comments": {
    icon: MessageSquare,
    title: "No comments",
    description: "No conversation has taken place on this report.",
  },
  "no-notes": {
    icon: MessageSquare,
    title: "No notes",
    description: "No investigation notes have been added yet.",
  },
  "no-admin": {
    icon: UserX,
    title: "No admin assigned",
    description: "This report has not been assigned to an administrator.",
  },
};

export function EmptyReports({
  variant = "no-reports",
  title,
  description,
  action,
  className,
}: EmptyReportsProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {title ?? config.title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {description ?? config.description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
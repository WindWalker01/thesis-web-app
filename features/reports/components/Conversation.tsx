"use client";

import { useEffect, useRef } from "react";
import type { ReportComment } from "@/features/reports/types";
import { formatDateTime } from "@/features/reports/lib/report-utils";
import { cn } from "@/lib/client-utils";

type ConversationProps = {
  comments: ReportComment[];
  currentUserId: string;
};

export function Conversation({ comments, currentUserId }: ConversationProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      </div>
    );
  }

  // Sort ascending so newest is at bottom
  const sorted = [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-4" role="log" aria-label="Conversation messages">
      {sorted.map((comment) => {
        const isAdmin = comment.is_admin;
        const isOwn = comment.user_id === currentUserId;

        return (
          <div
            key={comment.id}
            className={cn("flex gap-3", isOwn ? "justify-end" : "justify-start")}
          >
            {/* Avatar */}
            {!isOwn && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {isAdmin ? "A" : "Y"}
              </div>
            )}

            <div className={cn("max-w-[80%] space-y-1", isOwn && "items-end flex flex-col")}>
              {/* Sender info */}
              <div
                className={cn(
                  "flex items-center gap-2 text-xs",
                  isOwn && "flex-row-reverse"
                )}
              >
                <span className="font-medium">
                  {isAdmin
                    ? "Administrator"
                    : "You"}
                </span>
                {isAdmin && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Admin
                  </span>
                )}
                <time
                  className="text-muted-foreground/60"
                  dateTime={comment.created_at}
                >
                  {formatDateTime(comment.created_at)}
                </time>
              </div>

              {/* Message bubble */}
              <div
                className={cn(
                  "rounded-xl px-3 py-2 text-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{comment.message}</p>
              </div>
            </div>

            {/* Avatar for own messages */}
            {isOwn && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                Y
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { EmptyReports } from "./EmptyReports";
import type { ReportComment } from "@/features/reports/types";

interface AdminNotesProps {
  comments: ReportComment[];
  isLoading?: boolean;
  onSendComment: (message: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isSending: boolean;
  canDelete?: (comment: ReportComment) => boolean;
}

export function AdminNotes({
  comments,
  isLoading,
  onSendComment,
  onDeleteComment,
  isSending,
  canDelete,
}: AdminNotesProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = async () => {
    if (!newMessage.trim() || isSending) return;
    await onSendComment(newMessage.trim());
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Investigation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-16 animate-pulse rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Investigation Notes ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length === 0 ? (
          <EmptyReports
            variant="no-comments"
            title="No notes yet"
            description="No investigation notes have been added to this report."
          />
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "flex gap-3 rounded-lg p-3",
                  comment.is_admin ? "bg-primary/5" : "bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    comment.is_admin
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {comment.is_admin ? "A" : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {comment.is_admin ? "Admin" : "User"}
                      <span className="ml-2 font-normal text-muted-foreground/60">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </p>
                    {canDelete?.(comment) && onDeleteComment && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {comment.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Add note */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add an investigation note..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newMessage.trim() || isSending}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Sending..." : "Add Note"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
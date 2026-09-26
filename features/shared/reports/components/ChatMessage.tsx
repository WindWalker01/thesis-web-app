"use client";

import Image from "next/image";
import { cn } from "@/lib/client-utils";
import type { ChatMessage as ChatMessageType } from "@/features/reports/types";
import { formatChatTimestamp } from "@/features/reports/lib/report-utils";

type ChatMessageProps = {
  message: ChatMessageType;
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string | null;
  showSender?: boolean;
};

export function ChatMessage({
  message,
  isOwn,
  senderName,
  senderAvatar,
  showSender = true,
}: ChatMessageProps) {
  const isSending = message.status === "sending";
  const isSeen = message.read_at !== null;
  const isImage = message.message_type === "image" && message.file_url;
  const isDocument = message.message_type === "document" && message.file_url;

  return (
    <div
      className={cn(
        "flex gap-2.5 group",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar (left side for others) */}
      {!isOwn && (
        <div className="flex-shrink-0 self-end">
          {senderAvatar ? (
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-muted">
              <Image
                src={senderAvatar}
                alt={senderName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              {senderName.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] space-y-0.5",
          isOwn && "flex flex-col items-end"
        )}
      >
        {/* Sender name + timestamp */}
        {showSender && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-[10px]",
              isOwn && "flex-row-reverse"
            )}
          >
            <span className="font-medium text-muted-foreground">
              {isOwn ? "You" : senderName}
            </span>
            {message.is_admin && (
              <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
                Admin
              </span>
            )}
            <time
              className="text-muted-foreground/50"
              dateTime={message.created_at}
            >
              {formatChatTimestamp(message.created_at)}
            </time>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md",
            isSending && "opacity-70"
          )}
        >
          {/* Image attachment */}
          {isImage && message.file_url && (
            <div className="mb-2 overflow-hidden rounded-lg">
              <Image
                src={message.file_url}
                alt={message.file_name ?? "Image attachment"}
                width={300}
                height={200}
                className="max-h-48 w-full object-cover"
              />
            </div>
          )}

          {/* Document attachment */}
          {isDocument && message.file_url && (
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 flex items-center gap-2 rounded-lg border border-border/50 bg-background/10 p-2 text-xs hover:bg-background/20 transition-colors"
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span className="truncate">{message.file_name ?? "Document"}</span>
            </a>
          )}

          {/* Text content */}
          {message.message && (
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          )}
        </div>

        {/* Delivery status */}
        {isOwn && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
            {isSending ? (
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </span>
            ) : isSeen ? (
              <span className="flex items-center gap-1 text-blue-500">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Seen
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Sent
              </span>
            )}
          </div>
        )}
      </div>

      {/* Avatar (right side for own messages) */}
      {isOwn && (
        <div className="flex-shrink-0 self-end">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
            Y
          </div>
        </div>
      )}
    </div>
  );
}
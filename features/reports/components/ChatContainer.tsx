"use client";

import { useCallback, useMemo } from "react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ConnectionStatus } from "./ConnectionStatus";
import { NewMessagesButton } from "./NewMessagesButton";
import { useChatScroll } from "@/features/reports/hooks/useChatScroll";
import { useTypingIndicator } from "@/features/reports/hooks/useTypingIndicator";
import { useReadReceipts } from "@/features/reports/hooks/useReadReceipts";
import { useDesktopNotification } from "@/features/reports/hooks/useDesktopNotification";
import { ChatInput } from "./ChatInput";
import type { ChatMessage as ChatMessageType, RealtimeConnectionStatus } from "@/features/reports/types";

type ChatContainerProps = {
  reportId: string;
  currentUserId: string;
  currentUserName: string;
  messages: ChatMessageType[];
  onSendMessage: (content: string) => Promise<void>;
  onUploadEvidence?: (file: File, description?: string) => Promise<void>;
  connectionStatus: RealtimeConnectionStatus;
  reportTitle: string;
  disabled?: boolean;
  adminName?: string;
  reporterName?: string;
  reporterAvatar?: string | null;
  adminAvatar?: string | null;
};

export function ChatContainer({
  reportId,
  currentUserId,
  messages,
  onSendMessage,
  onUploadEvidence,
  connectionStatus,
  reportTitle,
  disabled = false,
  adminName = "Admin",
  reporterName = "Reporter",
  reporterAvatar,
  adminAvatar,
}: ChatContainerProps) {
  // Scroll management
  const {
    containerRef,
    bottomRef,
    showNewMessagesButton,
    scrollToBottom,
    handleScroll,
  } = useChatScroll({ messagesCount: messages.length });

  // Typing indicator
  const {
    typingUsers,
    startTyping,
    stopTyping,
  } = useTypingIndicator({
    reportId,
    currentUserId,
    enabled: !disabled,
  });

  // Read receipts
  useReadReceipts({
    reportId,
    currentUserId,
    enabled: !disabled,
  });

  // Desktop notifications
  const { notifyNewMessage } = useDesktopNotification({
    reportId,
    reportTitle,
    enabled: true,
  });

  // Determine if current user is admin for display purposes
  const isCurrentUserAdmin = useCallback(
    (userId: string) => {
      // We determine this based on the message is_admin flag for the most recent message from this user
      const userMessages = messages.filter((m) => m.user_id === userId);
      return userMessages.some((m) => m.is_admin);
    },
    [messages]
  );

  // Get display name for a user
  const getDisplayName = useCallback(
    (userId: string, isAdmin: boolean) => {
      if (userId === currentUserId) return "You";
      return isAdmin ? adminName : reporterName;
    },
    [currentUserId, adminName, reporterName]
  );

  // Get avatar for a user
  const getAvatar = useCallback(
    (userId: string, isAdmin: boolean) => {
      if (userId === currentUserId) return null; // We don't show own avatar in the bubble
      return isAdmin ? adminAvatar : reporterAvatar;
    },
    [currentUserId, adminAvatar, reporterAvatar]
  );

  // Typing display names
  const typingDisplayNames = useMemo(() => {
    return typingUsers.map((u) => {
      const isAdmin = u.is_admin || messages.some((m) => m.user_id === u.user_id && m.is_admin);
      return getDisplayName(u.user_id, isAdmin);
    });
  }, [typingUsers, messages, getDisplayName]);

  // Handle new message notification
  const handleIncomingMessage = useCallback(
    (comment: ChatMessageType) => {
      if (comment.user_id !== currentUserId && !document.hasFocus()) {
        notifyNewMessage(comment, comment.is_admin);
      }
    },
    [currentUserId, notifyNewMessage]
  );

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-background to-background/95">
      {/* Connection Status Banner */}
      <div className="flex-shrink-0">
        <ConnectionStatus status={connectionStatus} />
      </div>

      {/* Messages Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scroll-smooth"
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30 shadow-sm">
              <svg
                className="h-8 w-8 text-blue-500 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">No messages yet</p>
            <p className="mt-1.5 text-xs text-muted-foreground/70 max-w-[240px]">
              Start the conversation by sending a message below.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.user_id === currentUserId;
          const isAdmin = msg.is_admin;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showSender = !prevMsg || prevMsg.user_id !== msg.user_id;
          const isNewDay = index === 0 || (prevMsg && new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString());

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {isNewDay && messages.length > 1 && (
                <div className="flex items-center gap-3 py-3" role="separator" aria-label={`Messages from ${new Date(msg.created_at).toLocaleDateString()}`}>
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-[10px] font-medium text-muted-foreground/60 shrink-0">
                    {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
              )}
              <ChatMessage
                message={msg}
                isOwn={isOwn}
                senderName={getDisplayName(msg.user_id, isAdmin)}
                senderAvatar={getAvatar(msg.user_id, isAdmin)}
                showSender={showSender}
              />
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingDisplayNames.length > 0 && (
          <div className="py-1">
            <TypingIndicator displayName={typingDisplayNames.join(", ")} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* New Messages Button */}
      {showNewMessagesButton && (
        <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <NewMessagesButton onClick={scrollToBottom} />
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="shrink-0 border-t border-border/60 bg-background/90 backdrop-blur-sm px-3 py-3 sm:px-4">
        <div id="chat-input">
          <ChatInput
            onSend={onSendMessage}
            onUploadEvidence={onUploadEvidence}
            onTyping={startTyping}
            onStopTyping={stopTyping}
            disabled={disabled}
            placeholder={disabled ? "This report is closed" : "Type a message..."}
          />
        </div>
        {disabled && (
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
            This report is closed. You cannot send new messages.
          </p>
        )}
      </div>
    </div>
  );
}
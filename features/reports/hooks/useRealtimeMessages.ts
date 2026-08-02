"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type {
  ChatMessage,
  MessageStatus,
  ReportComment,
} from "@/features/reports/types";

type UseRealtimeMessagesOptions = {
  reportId: string;
  currentUserId: string;
  initialMessages?: ReportComment[];
  enabled?: boolean;
};

type OptimisticMessage = {
  temp_id: string;
  report_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  read_at: null;
  file_url: null;
  file_name: null;
  mime_type: null;
  message_type: "text";
  parent_id: null;
  status: MessageStatus;
  id: string;
};

const MAX_VISIBLE_MESSAGES = 100;

export function useRealtimeMessages({
  reportId,
  currentUserId,
  initialMessages = [],
  enabled = true,
}: UseRealtimeMessagesOptions) {
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const pendingMessages = useRef<OptimisticMessage[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connecting");

  // Transform initial comments to ChatMessages
  const baseMessages: ChatMessage[] = initialMessages.map((c) => ({
    ...c,
    status: "sent" as MessageStatus,
  }));

  // Merge base messages with live messages
  const mergedMessages = useCallback(() => {
    const msgMap = new Map<string, ChatMessage>();

    // Add base messages
    for (const msg of baseMessages) {
      if (!msgMap.has(msg.id)) {
        msgMap.set(msg.id, msg);
      }
    }

    // Override with live messages
    for (const msg of liveMessages) {
      msgMap.set(msg.id, msg);
    }

    // Sort by created_at ascending
    const sorted = Array.from(msgMap.values()).sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    // Limit to last N messages
    return sorted.length > MAX_VISIBLE_MESSAGES
      ? sorted.slice(-MAX_VISIBLE_MESSAGES)
      : sorted;
  }, [baseMessages, liveMessages]);

  // Send a message (optimistic)
  const sendMessage = useCallback(
    async (content: string): Promise<ChatMessage> => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const optimistic: OptimisticMessage = {
        temp_id: tempId,
        report_id: reportId,
        user_id: currentUserId,
        message: content,
        is_admin: false,
        created_at: new Date().toISOString(),
        read_at: null,
        file_url: null,
        file_name: null,
        mime_type: null,
        message_type: "text",
        parent_id: null,
        status: "sending",
        id: tempId,
      };

      pendingMessages.current = [...pendingMessages.current, optimistic];
      setLiveMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        { ...optimistic, status: "sending" } as unknown as ChatMessage,
      ]);

      try {
        const res = await fetch(`/api/reports/${reportId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message ?? "Failed to send message");
        }

        const json = await res.json();
        if (!json.success) {
          throw new Error(json?.error?.message ?? "Failed to send message");
        }

        const serverComment = json.data as ReportComment;

        // Remove optimistic from the pending queue
        pendingMessages.current = pendingMessages.current.filter(
          (p) => p.temp_id !== tempId,
        );

        // Replace the optimistic message with the authoritative server comment
        // so it renders immediately after a successful insert. If Realtime
        // already delivered the same server comment, avoid a duplicate.
        setLiveMessages((prev) => {
          const withoutTemp = prev.filter(
            (m) => m.id !== tempId && m.temp_id !== tempId,
          );
          if (!withoutTemp.some((m) => m.id === serverComment.id)) {
            withoutTemp.push({
              ...serverComment,
              status: "sent" as MessageStatus,
            });
          }
          return withoutTemp;
        });

        return { ...serverComment, status: "sent" as MessageStatus };
      } catch (error) {
        // Remove failed optimistic
        pendingMessages.current = pendingMessages.current.filter(
          (p) => p.temp_id !== tempId,
        );
        setLiveMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw error;
      }
    },
    [reportId, currentUserId],
  );

  // Set up Realtime subscription
  useEffect(() => {
    if (!enabled || !reportId) return;

    // Reset to "connecting" on (re)subscription. Deferred to a macrotask so we
    // don't synchronously set state inside the effect body (React lint rule).
    const connectingTimer = setTimeout(() => {
      setConnectionStatus("connecting");
    }, 0);

    const channelName = `report-messages-${reportId}`;

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: currentUserId },
      },
    });

    // Listen for new comments
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "report_comments",
        filter: `report_id=eq.${reportId}`,
      },
      (payload) => {
        const newComment = payload.new as ReportComment;

        // Own message — reconcile the optimistic copy with the authoritative
        // server row. This is needed because the optimistic message has a
        // temp id, while Realtime carries the real DB id.
        if (newComment.user_id === currentUserId) {
          setLiveMessages((prev) => {
            // Authoritative copy already present (POST success path added it)
            if (prev.some((m) => m.id === newComment.id)) {
              return prev;
            }

            // Find and remove the matching optimistic message (temp_id marker)
            const pendingIndex = pendingMessages.current.findIndex(
              (p) => p.temp_id && p.message === newComment.message,
            );
            if (pendingIndex >= 0) {
              const tempId = pendingMessages.current[pendingIndex].temp_id;
              pendingMessages.current.splice(pendingIndex, 1);

              const withoutOptimistic = prev.filter(
                (m) => m.id !== tempId && m.temp_id !== tempId,
              );
              return [
                ...withoutOptimistic,
                { ...newComment, status: "sent" as MessageStatus },
              ];
            }

            return [
              ...prev,
              { ...newComment, status: "sent" as MessageStatus },
            ];
          });
          return;
        }

        // Add incoming message
        setLiveMessages((prev) => {
          const exists = prev.find((m) => m.id === newComment.id);
          if (exists) return prev;
          return [
            ...prev,
            { ...newComment, status: "delivered" as MessageStatus },
          ];
        });
      },
    );

    // Listen for read receipt updates
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "report_comments",
        filter: `report_id=eq.${reportId}`,
      },
      (payload) => {
        const updated = payload.new as ReportComment;
        if (updated.read_at) {
          setLiveMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id
                ? {
                    ...m,
                    read_at: updated.read_at,
                    status: "seen" as MessageStatus,
                  }
                : m,
            ),
          );
        }
      },
    );

    // Track connection state via subscribe callback
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setConnectionStatus("connected");
        setIsOffline(false);
      } else if (status === "CHANNEL_ERROR") {
        setConnectionStatus("disconnected");
        setIsOffline(true);
      }
    });

    channelRef.current = channel;

    return () => {
      clearTimeout(connectingTimer);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [reportId, enabled, currentUserId]);

  const messages = mergedMessages();

  return {
    messages,
    sendMessage,
    connectionStatus,
    isOffline,
  };
}

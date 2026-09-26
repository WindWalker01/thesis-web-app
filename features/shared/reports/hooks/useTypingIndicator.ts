"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { TypingUser } from "@/features/reports/types";

type UseTypingIndicatorOptions = {
  reportId: string;
  currentUserId: string;
  enabled?: boolean;
};

const TYPING_TIMEOUT_MS = 3000;
const BROADCAST_INTERVAL_MS = 2000;

export function useTypingIndicator({
  reportId,
  currentUserId,
  enabled = true,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const isTypingRef = useRef(false);
  const lastBroadcastRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Broadcast typing status
  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current) return;

      const now = Date.now();
      if (isTyping && now - lastBroadcastRef.current < BROADCAST_INTERVAL_MS) {
        return; // Throttle broadcasts
      }

      lastBroadcastRef.current = now;
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId, isTyping, timestamp: now },
      });
    },
    [currentUserId]
  );

  // Start typing
  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setIsTyping(true);
      broadcastTyping(true);
    }

    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      setIsTyping(false);
      broadcastTyping(false);
    }, TYPING_TIMEOUT_MS);
  }, [broadcastTyping]);

  // Stop typing (call when message is sent)
  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      setIsTyping(false);
      broadcastTyping(false);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [broadcastTyping]);

  // Set up Realtime channel for typing broadcasts
  useEffect(() => {
    if (!enabled || !reportId) return;

    const channelName = `report-typing-${reportId}`;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel.on(
      "broadcast",
      { event: "typing" },
      (payload) => {
        const { userId, isTyping, timestamp } = payload.payload as {
          userId: string;
          isTyping: boolean;
          timestamp: number;
        };

        if (userId === currentUserId) return;

        setTypingUsers((prev) => {
          if (isTyping) {
            // Add or update
            const exists = prev.find((u) => u.user_id === userId);
            if (exists) {
              return prev.map((u) =>
                u.user_id === userId
                  ? { ...u, started_typing_at: new Date(timestamp).toISOString() }
                  : u
              );
            }
            return [
              ...prev,
              {
                user_id: userId,
                started_typing_at: new Date(timestamp).toISOString(),
                display_name: "",
                is_admin: false,
              },
            ];
          } else {
            // Remove
            return prev.filter((u) => u.user_id !== userId);
          }
        });
      }
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      // Clean up: broadcast stop typing
      if (isTypingRef.current) {
        broadcastTyping(false);
      }
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [reportId, enabled, currentUserId, broadcastTyping]);

  // Clean up typing users that haven't sent an update in 5 seconds
  useEffect(() => {
    if (!enabled || typingUsers.length === 0) return;

    const interval = setInterval(() => {
      const cutoff = Date.now() - 5000;
      setTypingUsers((prev) =>
        prev.filter((u) => new Date(u.started_typing_at).getTime() > cutoff)
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, typingUsers.length]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping,
  };
}
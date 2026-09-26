"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type UseChatScrollOptions = {
  messagesCount: number;
  enabled?: boolean;
};

export function useChatScroll({ messagesCount, enabled = true }: UseChatScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
  const prevMessagesCount = useRef(messagesCount);
  const isScrolledUpRef = useRef(false);
  const isAutoScrolling = useRef(false);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (isAutoScrolling.current) return;

    const container = containerRef.current;
    if (!container) return;

    const threshold = 150;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

    const newIsScrolledUp = !atBottom;
    if (newIsScrolledUp !== isScrolledUpRef.current) {
      isScrolledUpRef.current = newIsScrolledUp;
      setIsScrolledUp(newIsScrolledUp);
    }

    if (atBottom && showNewMessagesButton) {
      setShowNewMessagesButton(false);
    }
  }, [showNewMessagesButton]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    isAutoScrolling.current = true;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMessagesButton(false);
    setIsScrolledUp(false);
    isScrolledUpRef.current = false;
    setTimeout(() => {
      isAutoScrolling.current = false;
    }, 400);
  }, []);

  // Watch for new messages
  useEffect(() => {
    if (!enabled) return;

    const prevCount = prevMessagesCount.current;
    prevMessagesCount.current = messagesCount;

    if (messagesCount > prevCount && !isScrolledUpRef.current) {
      isAutoScrolling.current = true;
      const raf = requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 400);
      return () => {
        cancelAnimationFrame(raf);
      };
    }
  }, [messagesCount, enabled]);

  return {
    containerRef,
    bottomRef,
    isScrolledUp,
    showNewMessagesButton,
    scrollToBottom,
    handleScroll,
  };
}
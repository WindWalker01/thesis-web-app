"use client";

import { cn } from "@/lib/client-utils";

type TypingIndicatorProps = {
  displayName: string;
};

export function TypingIndicator({ displayName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-1 py-1.5">
      <div className="flex items-center gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
      </div>
      <span className="text-[11px] italic text-muted-foreground/70">
        {displayName} is typing...
      </span>
    </div>
  );
}
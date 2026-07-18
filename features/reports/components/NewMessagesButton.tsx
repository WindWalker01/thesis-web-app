"use client";

import { Button } from "@/components/ui/button";

type NewMessagesButtonProps = {
  onClick: () => void;
  count?: number;
};

export function NewMessagesButton({ onClick, count }: NewMessagesButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        onClick={onClick}
        variant="secondary"
        size="sm"
        className="h-7 gap-1.5 rounded-full px-3 text-xs shadow-sm animate-in slide-in-from-bottom-2"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
        {count ? `New Messages (${count})` : "New Messages"}
      </Button>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/client-utils";

/**
 * Renders a (usually truncated) monospace value with a tap-to-copy affordance.
 * Copies the full value — important on mobile where selecting long hashes by
 * hand is painful.
 */
export function CopyField({
  value,
  display,
  className,
}: {
  value: string;
  display?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — silently no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied" : "Copy"}
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded-md font-mono text-sm text-slate-900 transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-white dark:hover:text-blue-400",
        className,
      )}
    >
      <span className="truncate">{display ?? value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-blue-500" />
      )}
    </button>
  );
}

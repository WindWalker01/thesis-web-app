"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
    value: string;
    label?: string;
};

export function CopyButton({ value, label = "Copy" }: Props) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            aria-label={label}
            title={label}
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : label}
        </button>
    );
}
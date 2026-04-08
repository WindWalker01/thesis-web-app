"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
    title?: string;
    description?: string;
    children: React.ReactNode;
};

export function TechnicalDetailsToggle({
    title = "Advanced Technical Details",
    description = "Hashes, chain record, evidence payload, and stored plagiarism payload.",
    children,
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-background/40 transition-colors"
            >
                <div>
                    <p className="text-sm font-bold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>

                <span className="shrink-0 text-muted-foreground">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
            </button>

            {open && <div className="border-t border-border p-4 md:p-5">{children}</div>}
        </section>
    );
}
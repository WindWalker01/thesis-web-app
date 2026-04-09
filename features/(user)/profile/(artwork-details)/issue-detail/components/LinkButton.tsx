import { ExternalLink } from "lucide-react";

export function LinkButton({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
        >
            <ExternalLink className="w-4 h-4" />
            {label}
        </a>
    );
}

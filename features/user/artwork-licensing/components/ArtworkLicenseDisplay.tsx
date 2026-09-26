import { Check, X } from "lucide-react";

import { cn } from "@/lib/client-utils";
import {
  LICENSE_DISCLAIMER,
  permissionChecklist,
  resolveLicense,
} from "@/features/artwork-licensing/lib/licenses";

type ArtworkLicenseDisplayProps = {
  /** Stored license identifier; unknown/missing values resolve to ARR. */
  identifier?: string | null;
  /** Artist display name rendered as "© <name>". */
  artistName?: string | null;
  className?: string;
};

/**
 * Read-only license summary for a public or owner artwork page. Renders the
 * full license name (linking to the official Creative Commons page when
 * applicable), a compact ✓/✕ permission checklist, a © attribution line, and
 * the project disclaimer. This section documents the license the creator
 * selected — it does not determine ownership or represent legal advice.
 */
export function ArtworkLicenseDisplay({
  identifier,
  artistName,
  className,
}: ArtworkLicenseDisplayProps) {
  const license = resolveLicense(identifier);
  const checklist = permissionChecklist(license);

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="text-foreground text-lg font-bold">{license.name}</p>

        {artistName ? (
          <p className="text-muted-foreground mt-1 text-sm">
            © {artistName}
          </p>
        ) : null}

        {license.url ? (
          <a
            href={license.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-2 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
          >
            View Full License Terms
          </a>
        ) : null}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {checklist.map((item) => (
          <li
            key={item.key}
            className="text-muted-foreground flex items-center gap-2 text-sm"
          >
            {item.allowed ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <X className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span>
              {item.label} — {item.note}
            </span>
          </li>
        ))}
      </ul>

      {license.permissions.permissionRequired ? (
        <p className="text-foreground text-sm font-semibold">
          Permission required for other uses
        </p>
      ) : null}

      <p className="text-muted-foreground text-xs leading-5">
        {LICENSE_DISCLAIMER}
      </p>
    </div>
  );
}
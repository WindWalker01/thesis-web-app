"use client";

import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/client-utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  LICENSES,
  LICENSE_DISCLAIMER,
  permissionChecklist,
  resolveLicense,
  type LicenseIdentifier,
} from "@/features/artwork-licensing/lib/licenses";

type ArtworkLicenseSelectorProps = {
  /** Currently selected license identifier (initial value). */
  value: LicenseIdentifier;
  /** Called with the newly selected license identifier. */
  onChange: (value: LicenseIdentifier) => void;
  /** Optional id for accessible labelling of the first radio control. */
  id?: string;
};

/**
 * Reusable license picker used by both the artwork upload form and the
 * artwork license edit flow. Renders the full supported set of licenses as
 * radio cards, a short plain-language description of the selected license,
 * its permissions, a link to the official terms, and the project disclaimer.
 */
export function ArtworkLicenseSelector({
  value,
  onChange,
  id,
}: ArtworkLicenseSelectorProps) {
  const selected = resolveLicense(value);
  const checklist = permissionChecklist(selected);

  return (
    <div className="space-y-4">
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as LicenseIdentifier)}
        className="grid gap-2"
      >
        {LICENSES.map((license) => {
          const checked = license.id === value;
          return (
            <label
              key={license.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                checked
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <RadioGroupItem
                value={license.id}
                id={`${id ?? "license"}-${license.id}`}
                className="mt-0.5 shrink-0"
              />
              <span className="min-w-0 space-y-0.5">
                <span className="text-foreground block text-sm font-semibold">
                  {license.name}
                </span>
                <span className="text-muted-foreground block text-sm leading-5">
                  {license.description}
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-foreground text-sm font-semibold">
          {selected.name}
        </p>

        {selected.url ? (
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-1 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
          >
            View Full License Terms
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="text-muted-foreground mt-1 text-sm">
            No external license terms apply. Permission from the artist is
            required for any use.
          </p>
        )}

        <dl className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {checklist.map((item) => (
            <div
              key={item.key}
              className="flex items-baseline justify-between gap-2 text-sm"
            >
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd
                className={cn(
                  "text-right font-medium",
                  item.allowed ? "text-emerald-600" : "text-destructive",
                )}
              >
                {item.allowed ? "Permitted" : "Not permitted"}
              </dd>
            </div>
          ))}
        </dl>

        {selected.permissions.permissionRequired ? (
          <p className="mt-2 text-sm font-medium">
            Permission required for other uses
          </p>
        ) : null}
      </div>

      <p className="text-muted-foreground text-xs leading-5">
        {LICENSE_DISCLAIMER}
      </p>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArtworkLicenseDisplay } from "@/features/artwork-licensing/components/ArtworkLicenseDisplay";
import { ChangeLicenseDialog } from "./ChangeLicenseDialog";

type LicenseSectionProps = {
  artId: string;
  /** Stored license identifier; unknown values resolve to All Rights Reserved. */
  licenseIdentifier: string | null;
  /** Artist display name rendered as "© <name>". */
  artistName?: string | null;
  /** When true, renders the owner-only "Change License" control. */
  showChangeControl?: boolean;
};

/**
 * "License / Usage Permissions" section on the artwork detail page. Rendered
 * after the similarity section. Only the owner sees the change control; the
 * server action independently re-verifies ownership.
 */
export function LicenseSection({
  artId,
  licenseIdentifier,
  artistName,
  showChangeControl = false,
}: LicenseSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary inline-flex h-8 w-8 items-center justify-center rounded-lg">
              <Pencil className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              License &amp; Usage Permissions
            </span>
          </div>

          {showChangeControl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="shrink-0"
            >
              <Pencil className="h-3.5 w-3.5" />
              Change License
            </Button>
          ) : null}
        </div>

        <CardContent className="p-5 sm:p-6">
          <ArtworkLicenseDisplay
            identifier={licenseIdentifier}
            artistName={artistName}
          />
        </CardContent>
      </Card>

      {showChangeControl ? (
        <ChangeLicenseDialog
          open={open}
          onOpenChange={setOpen}
          artId={artId}
          currentLicenseId={licenseIdentifier}
        />
      ) : null}
    </>
  );
}
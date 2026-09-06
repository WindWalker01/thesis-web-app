"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArtworkLicenseSelector } from "@/features/artwork-licensing/components/ArtworkLicenseSelector";
import {
  resolveLicense,
  type LicenseIdentifier,
} from "@/features/artwork-licensing/lib/licenses";
import { changeArtworkLicense } from "@/features/artwork-licensing/server/change-artwork-license";
import { artworkDetailKeys } from "@/features/(user)/profile/subfeatures/artwork-detail/hooks/useArtworkDetailPage";
import { artworkKeys } from "@/features/(user)/profile/hooks/useFetchProfileArtworks";

type ChangeLicenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artId: string;
  /** Current license identifier; unknown values resolve to All Rights Reserved. */
  currentLicenseId: string | null;
};

/**
 * Modal for an artwork owner to change an artwork's license. Shows the same
 * reusable license selector used at upload time, then requires an explicit
 * confirmation before persisting the change because it can affect the
 * permissions granted to other users. The server action re-checks ownership.
 */
export function ChangeLicenseDialog({
  open,
  onOpenChange,
  artId,
  currentLicenseId,
}: ChangeLicenseDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"select" | "confirm">("select");
  const [selected, setSelected] = useState<LicenseIdentifier>(
    resolveLicense(currentLicenseId).id,
  );
  const [isSaving, setIsSaving] = useState(false);

  const current = resolveLicense(currentLicenseId);
  const next = resolveLicense(selected);

  /**
   * Reset the picker each time the dialog opens so it always reflects the
   * artwork's current license. Doing this in the open-change handler (rather
   * than an effect) avoids cascading renders.
   */
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSelected(resolveLicense(currentLicenseId).id);
      setStep("select");
      setIsSaving(false);
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    setIsSaving(true);

    const result = await changeArtworkLicense(artId, selected);

    setIsSaving(false);

    if (!result.success) {
      toast.error("License change failed", {
        description: result.message,
      });
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: artworkDetailKeys.byId(artId),
    });
    await queryClient.invalidateQueries({ queryKey: artworkKeys.all() });
    router.refresh();

    onOpenChange(false);
    toast.success("License updated", {
      description: result.message,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-primary/10 text-primary inline-flex h-9 w-9 items-center justify-center rounded-xl">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <DialogTitle>
            {step === "select" ? "Change license" : "Change Artwork License?"}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Choose how other people may use your artwork. The current license is selected."
              : "Changing the license may change the permissions granted to other users for this artwork."}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <div className="max-h-[60vh] overflow-y-auto rounded-2xl border bg-muted/10 p-4">
            <ArtworkLicenseSelector
              id="edit-license"
              value={selected}
              onChange={setSelected}
            />
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border bg-muted/10 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Current license</span>
              <span className="text-foreground text-right font-semibold">
                {current.name}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">New license</span>
              <span className="text-foreground text-right font-semibold">
                {next.name}
              </span>
            </div>
            <p className="text-muted-foreground text-xs leading-5">
              If the new license grants more permissive usage, other users may
              reuse your artwork accordingly. This will be reflected on your
              public artwork page.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === "confirm") {
                setStep("select");
              } else {
                onOpenChange(false);
              }
            }}
            disabled={isSaving}
          >
            {step === "confirm" ? "Back" : "Cancel"}
          </Button>

          {step === "select" ? (
            <Button type="button" onClick={() => setStep("confirm")}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm Change"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
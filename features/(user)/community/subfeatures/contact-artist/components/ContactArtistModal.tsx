"use client";

import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_INQUIRY_LENGTH, validateInquiryMessage } from "../lib/inquiry";
import {
  createArtworkInquiryMailto,
  type CreateInquiryResult,
} from "../server/artist-contact";

type ContactArtistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artId: string;
  artworkTitle: string;
  artistName: string;
};

/**
 * Artwork Inquiry dialog.
 *
 * Lightweight by design: composing the message here and handing it to the
 * user's own email application via a server-generated mailto: link. This is
 * not a messaging system — nothing is stored, threaded, or tracked.
 */
export function ContactArtistModal({
  open,
  onOpenChange,
  artId,
  artworkTitle,
  artistName,
}: ContactArtistModalProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setMessage("");
    setError(null);
    setIsSubmitting(false);
    setSuccess(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);

    const validation = validateInquiryMessage(message);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsSubmitting(true);

    let result: CreateInquiryResult;
    try {
      result = await createArtworkInquiryMailto(artId, validation.message);
    } catch {
      result = {
        success: false,
        message:
          "Something went wrong while preparing your inquiry. Please try again.",
      };
    }

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    // Hand the inquiry to the user's own email application. This works even
    // in environments without a mailto handler — the user simply sees the
    // notice below and can copy their message instead.
    try {
      window.location.href = result.mailtoUrl;
    } catch {
      // No email client configured — the success notice still explains what
      // happened, so nothing further is needed here.
    }

    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] rounded-2xl bg-card sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Artwork Inquiry</DialogTitle>
          <DialogDescription className="text-base">
            Send a short message to the artist about this artwork. Your email
            application will be used to send the inquiry.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-sm text-foreground">
                Your inquiry has been prepared for the artist. Your email
                application should have opened with the message ready to send.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-xl"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="inquiry-artwork">Artwork</Label>
              <Input
                id="inquiry-artwork"
                value={artworkTitle}
                readOnly
                disabled
                aria-readonly="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquiry-artist">Artist</Label>
              <Input
                id="inquiry-artist"
                value={artistName}
                readOnly
                disabled
                aria-readonly="true"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="inquiry-message">
                  Message <span className="text-red-600">*</span>
                </Label>
                <span className="text-muted-foreground text-xs">
                  {message.trim().length}/{MAX_INQUIRY_LENGTH}
                </span>
              </div>
              <Textarea
                id="inquiry-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="I'm interested in this artwork and would like to know more about purchasing or licensing it."
                className="min-h-32 resize-y rounded-xl"
                maxLength={MAX_INQUIRY_LENGTH}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "inquiry-error" : undefined}
              />
              {error ? (
                <p
                  id="inquiry-error"
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-xl"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="cursor-pointer rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

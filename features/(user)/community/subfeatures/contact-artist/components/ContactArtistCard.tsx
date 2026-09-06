"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getArtistContactInfo } from "../server/artist-contact";
import { ContactArtistModal } from "./ContactArtistModal";

type ContactArtistCardProps = {
  artId: string;
};

/**
 * "Contact Artist" entry point on the artwork value/community post detail
 * page. Checks the artist's contact availability server-side (the email
 * itself never reaches the client) and either offers the inquiry dialog or a
 * friendly note explaining that the artist cannot be contacted.
 */
export function ContactArtistCard({ artId }: ContactArtistCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: contact, isLoading } = useQuery({
    queryKey: ["artist-contact-info", artId],
    queryFn: () => getArtistContactInfo(artId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(artId),
  });

  // Own artwork / not contactable: show a quiet note instead of the button.
  if (!isLoading && (!contact || !contact.available)) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card/85 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-1.5">
            <Mail className="text-primary h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-foreground text-sm font-bold">
              Artwork Inquiry
            </p>
            <p className="text-muted-foreground text-sm">
              The artist has not provided a contact email for inquiries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-border/70 bg-card/85 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-1.5">
            <Mail className="text-primary h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-foreground text-sm font-bold">
                Interested in this artwork?
              </p>
              <p className="text-muted-foreground text-sm">
                Send a short inquiry to the artist about purchasing or
                licensing. Your own email application will be used to send it.
              </p>
            </div>

            <Button
              type="button"
              className="w-full cursor-pointer rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setDialogOpen(true)}
              disabled={isLoading}
            >
              <Mail className="h-4 w-4" />
              Contact Artist
            </Button>
          </div>
        </div>
      </div>

      {contact?.available ? (
        <ContactArtistModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          artId={artId}
          artworkTitle={contact.artworkTitle}
          artistName={contact.artistName}
        />
      ) : null}
    </>
  );
}

"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildArtworkInquiryMailto,
  formatArtistDisplayName,
  validateInquiryMessage,
} from "../lib/inquiry";

/**
 * Artwork Inquiry server actions.
 *
 * The artist's registered email is intentionally NEVER returned to the client.
 * The server composes the full `mailto:` URL (including the artist email) and
 * only that URL is sent back, so the modal can open the user's email client
 * without exposing the artist's contact information to the browser payload.
 *
 * No new database tables are involved — the inquiry is purely an email the
 * interested user sends from their own email application.
 */

const artIdSchema = z.string().uuid();

type ArtistContactRow = {
  title: string | null;
  owner: {
    email: string | null;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  }[] | null;
};

async function fetchArtistContact(artId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("registered_arts")
    .select(
      `
      title,
      owner:users!registered_arts_owner_id_fkey (
        email,
        username,
        first_name,
        last_name
      )
      `,
    )
    .eq("id", artId)
    .maybeSingle<ArtistContactRow>();

  if (error || !data) {
    return null;
  }

  const owner = Array.isArray(data.owner) ? data.owner[0] ?? null : data.owner;
  const email = owner?.email?.trim() ?? "";

  return {
    artworkTitle: data.title?.trim() || "Untitled artwork",
    artistName: formatArtistDisplayName({
      first_name: owner?.first_name ?? null,
      last_name: owner?.last_name ?? null,
      username: owner?.username ?? null,
    }),
    artistEmail: email,
  };
}

export type ArtistContactInfo =
  | {
      available: true;
      artworkTitle: string;
      artistName: string;
    }
  | { available: false };

/**
 * Check whether the artist behind an artwork can be contacted, and return the
 * read-only details (title + artist display name) the inquiry dialog needs.
 * No email is exposed to the client here.
 */
export async function getArtistContactInfo(
  artId: string,
): Promise<ArtistContactInfo> {
  try {
    const parsedId = artIdSchema.safeParse(artId);
    if (!parsedId.success) {
      return { available: false };
    }

    const contact = await fetchArtistContact(parsedId.data);
    if (!contact || contact.artistEmail.length === 0) {
      return { available: false };
    }

    return {
      available: true,
      artworkTitle: contact.artworkTitle,
      artistName: contact.artistName,
    };
  } catch {
    return { available: false };
  }
}

export type CreateInquiryResult =
  | { success: true; mailtoUrl: string }
  | { success: false; message: string };

/**
 * Compose the artwork inquiry email and return a `mailto:` URL the client can
 * open through the user's own email application.
 */
export async function createArtworkInquiryMailto(
  artId: string,
  rawMessage: string,
): Promise<CreateInquiryResult> {
  try {
    const parsedId = artIdSchema.safeParse(artId);
    if (!parsedId.success) {
      return {
        success: false,
        message: "This artwork could not be found. Please refresh and try again.",
      };
    }

    const validation = validateInquiryMessage(rawMessage);
    if (!validation.valid) {
      return { success: false, message: validation.error };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You need to be signed in to contact the artist.",
      };
    }

    const contact = await fetchArtistContact(parsedId.data);
    if (!contact || contact.artistEmail.length === 0) {
      return {
        success: false,
        message: "The artist has not provided a contact email for inquiries.",
      };
    }

    const userEmail =
      typeof user.email === "string" && user.email.trim().length > 0
        ? user.email.trim()
        : null;

    const mailtoUrl = buildArtworkInquiryMailto({
      artistEmail: contact.artistEmail,
      artistName: contact.artistName,
      artworkTitle: contact.artworkTitle,
      message: validation.message,
      userEmail,
    });

    return { success: true, mailtoUrl };
  } catch {
    return {
      success: false,
      message: "Something went wrong while preparing your inquiry. Please try again.",
    };
  }
}

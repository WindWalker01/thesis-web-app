import { z } from "zod";

/**
 * Artwork Inquiry (Contact Artist) — pure helpers shared between the client
 * modal and the server action.
 *
 * This feature is deliberately NOT a messaging system. It only prepares a
 * `mailto:` URL that the interested user's own email application sends to the
 * artist's registered email address.
 */

export const MIN_INQUIRY_LENGTH = 1;
export const MAX_INQUIRY_LENGTH = 2000;

export const EMPTY_MESSAGE_ERROR =
  "Please enter a message before sending your inquiry.";

export const inquiryMessageSchema = z
  .string()
  .trim()
  .min(MIN_INQUIRY_LENGTH, EMPTY_MESSAGE_ERROR)
  .max(
    MAX_INQUIRY_LENGTH,
    `Your message is too long. Please keep it under ${MAX_INQUIRY_LENGTH} characters.`,
  );

export type InquiryMessageValidation =
  | { valid: true; message: string }
  | { valid: false; error: string };

/**
 * Validate an inquiry message on the client (instant feedback) and again on
 * the server (defensive). Returns the trimmed message when valid.
 */
export function validateInquiryMessage(
  raw: string,
): InquiryMessageValidation {
  const parsed = inquiryMessageSchema.safeParse(raw);

  if (parsed.success) {
    return { valid: true, message: parsed.data };
  }

  return {
    valid: false,
    error: parsed.error.issues[0]?.message ?? EMPTY_MESSAGE_ERROR,
  };
}

export type InquiryMailtoInput = {
  artistEmail: string;
  artistName: string;
  artworkTitle: string;
  message: string;
  /** Email of the logged-in user sending the inquiry, when available. */
  userEmail?: string | null;
};

/**
 * Build the mailto: URL for an artwork inquiry.
 *
 * Format (kept deliberately simple):
 *   To:      artist's registered email
 *   Subject: Artwork Inquiry: [Artwork Title]
 *   Body:    greeting + interest line + the user's message + closing,
 *            with the sender's email appended when available so the artist
 *            knows how to reply.
 */
export function buildArtworkInquiryMailto({
  artistEmail,
  artistName,
  artworkTitle,
  message,
  userEmail,
}: InquiryMailtoInput): string {
  const bodyLines = [
    `Hello ${artistName},`,
    "",
    `I am interested in your artwork "${artworkTitle}".`,
    "",
    message,
    "",
    "Thank you.",
  ];

  if (userEmail) {
    bodyLines.push("", `From: ${userEmail}`);
  }

  const subject = `Artwork Inquiry: ${artworkTitle}`;
  const body = bodyLines.join("\n");

  return `mailto:${artistEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type ArtistNameInput = {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
};

/** Compose a display name for the artist, falling back to their username. */
export function formatArtistDisplayName({
  first_name,
  last_name,
  username,
}: ArtistNameInput): string {
  const name = [first_name, last_name]
    .filter((part) => part && part.trim().length > 0)
    .join(" ")
    .trim();

  if (name.length > 0) {
    return name;
  }

  return username?.trim() || "Unknown artist";
}

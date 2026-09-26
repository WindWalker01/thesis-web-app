import { z } from "zod";
import { LICENSE_IDS } from "./licenses";

/**
 * Validation schema for a license identifier. Restricted to the exact
 * supported set so an invalid identifier can never be stored.
 */
export const licenseIdentifierSchema = z.enum(LICENSE_IDS, {
  message: "Please choose a valid license for this artwork.",
});

export type LicenseIdentifierSchema = z.infer<
  typeof licenseIdentifierSchema
>;
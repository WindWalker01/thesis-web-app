import * as z from "zod";

function isCloudinarySecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const cloudName = process.env.CLOUDINARY_NAME;
    if (!cloudName) return parsed.hostname === "res.cloudinary.com";
    return (
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

/**
 * Metadata describing an asset the client already uploaded browser-direct to
 * Cloudinary (signed upload). Server actions and routes consume this instead
 * of raw file bytes so large files never travel through the Next.js server
 * (serverless hosts cap function request bodies at ~4.5 MB).
 *
 * The `secureUrl` is constrained to the project's own Cloudinary cloud so
 * server-side re-downloads can never be pointed at an arbitrary host.
 */
export const cloudinaryAssetMetadataSchema = z.object({
  publicId: z.string().min(1).max(512),
  assetId: z.string().min(1).max(128).nullish(),
  secureUrl: z
    .string()
    .url()
    .refine(isCloudinarySecureUrl, "Invalid storage URL."),
  format: z.string().max(32).nullish(),
  bytes: z.number().int().nonnegative(),
  /** Optional: original client-side file metadata (name/mime). */
  fileName: z.string().min(1).max(255).optional(),
  mimeType: z.string().max(128).optional(),
});

export type CloudinaryAssetMetadata = z.infer<
  typeof cloudinaryAssetMetadataSchema
>;

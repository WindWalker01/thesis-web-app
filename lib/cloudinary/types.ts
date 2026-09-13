/**
 * Shared, JSON-serializable contracts for browser-direct Cloudinary uploads.
 * Used by the signature server action, the browser upload helper, and every
 * server action/route that receives already-uploaded asset metadata.
 */

/** Result of a browser-direct upload to Cloudinary. */
export type CloudinaryDirectUpload = {
  publicId: string;
  assetId: string | null;
  secureUrl: string;
  format: string | null;
  bytes: number;
  width: number | null;
  height: number | null;
};

/** Signed-upload credentials issued by the signature server action. */
export type CloudinaryUploadSignature = {
  apiKey: string;
  timestamp: number;
  signature: string;
  cloudName: string;
  folder: string;
};

export type CloudinarySignatureResult =
  | ({ success: true } & CloudinaryUploadSignature)
  | { success: false; message: string };

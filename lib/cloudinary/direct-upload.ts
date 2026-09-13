import { describeAnalysisError } from "@/lib/analysis-errors";
import { getCloudinaryUploadSignature } from "./signature";
import type { CloudinaryDirectUpload } from "./types";

/**
 * Browser-direct upload of a raw file to Cloudinary using a signed payload
 * issued by `getCloudinaryUploadSignature`.
 *
 * The file bytes go straight from the browser to Cloudinary, bypassing the
 * Next.js server entirely — required because serverless hosts cap function
 * request bodies (e.g. Vercel's 4.5 MB `FUNCTION_PAYLOAD_TOO_LARGE`), which
 * rejects larger files sent through Server Actions or route handlers.
 *
 * Only `{ api_key, timestamp, signature, folder, file }` may be sent — the
 * signature covers exactly `folder` + `timestamp`.
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string,
  options: { resourceType?: "image" | "auto" } = {},
): Promise<CloudinaryDirectUpload> {
  const resourceType = options.resourceType ?? "image";

  const signature = await getCloudinaryUploadSignature(folder);
  if (!signature.success) {
    throw new Error(signature.message);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  let response: Response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
        // Large artwork files over slow links; generous but bounded.
        signal: AbortSignal.timeout(120_000),
      },
    );
  } catch (err) {
    throw new Error(describeAnalysisError(err));
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error?.message ??
        `Storage upload failed (${response.status}).`,
    );
  }

  const result = await response.json();
  if (!result?.public_id || !result?.secure_url) {
    throw new Error("Storage upload failed: unexpected response.");
  }

  return {
    publicId: result.public_id,
    assetId: result.asset_id ?? null,
    secureUrl: result.secure_url,
    format: result.format ?? null,
    bytes: result.bytes ?? file.size,
    width: result.width ?? null,
    height: result.height ?? null,
  };
}

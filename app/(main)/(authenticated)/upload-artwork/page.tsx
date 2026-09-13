// The upload-artwork pipeline (server actions for Cloudinary-metadata
// registration, similarity scan, genre classify, blockchain write) can take
// minutes on large artworks; without this, serverless hosts kill the
// function early (Vercel 504 FUNCTION_INVOCATION_TIMEOUT). Vercel clamps to
// the plan maximum. Server actions invoked from this route run in the same
// function context, so the segment config covers them.
export const maxDuration = 300;

import UploadArtworkPage from "@/features/(user)/upload-artwork/components/page";

export default function Page() {
    return (
        <UploadArtworkPage />
    );
}
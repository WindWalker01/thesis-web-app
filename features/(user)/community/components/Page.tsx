import { isAuthenticated } from "@/lib/server-utils";
import GalleryPageClient from "./gallery-page-client";

export default async function GalleryPage() {
    const authed = await isAuthenticated();

    return <GalleryPageClient authed={authed} />;
}
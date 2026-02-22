import { isAuthenticated } from "@/lib/server-utils";
import GalleryPageClient from "./GalleryPageClient";

export default async function GalleryPage() {
    const authed = true;

    return (
        <GalleryPageClient
            authed={authed}
        />
    );
}
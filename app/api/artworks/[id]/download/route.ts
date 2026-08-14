import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/server-utils";

type RawArtworkDownloadRow = {
  id: string;
  owner_id: string;
  title: string;
  c_secure_url: string | null;
  evidence: { filename?: string; mime?: string } | null;
};

function sanitizeFilename(value: string): string {
  // Strip path separators and control characters, collapse whitespace.
  return value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDownloadFilename(
  evidence: RawArtworkDownloadRow["evidence"],
  title: string,
  extension: string,
): string {
  const extensionWithDot = extension.startsWith(".")
    ? extension
    : `.${extension}`;

  if (evidence?.filename) {
    const clean = sanitizeFilename(evidence.filename);

    // If the original filename already has a usable extension, keep it as-is.
    if (/\.[a-z0-9]{1,10}$/i.test(clean)) {
      return clean;
    }

    return `${clean}${extensionWithDot}`;
  }

  const base = sanitizeFilename(title) || "artwork";
  return `${base}${extensionWithDot}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("registered_arts")
    .select("id, owner_id, title, c_secure_url, evidence")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to load artwork." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
  }

  const artwork = data as RawArtworkDownloadRow;

  if (!artwork.c_secure_url) {
    return NextResponse.json(
      { error: "Original artwork file is unavailable." },
      { status: 404 },
    );
  }

  let fileResponse: Response;
  try {
    fileResponse = await fetch(artwork.c_secure_url);
  } catch {
    return NextResponse.json(
      { error: "Failed to download the original artwork." },
      { status: 502 },
    );
  }

  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: "Failed to download the original artwork." },
      { status: 502 },
    );
  }

  const blob = await fileResponse.arrayBuffer();

  const extension =
    artwork.evidence?.mime?.split("/")[1] ||
    /\.([a-z0-9]{1,10})$/i.exec(artwork.c_secure_url)?.[1] ||
    "bin";

  const filename = buildDownloadFilename(
    artwork.evidence,
    artwork.title,
    extension,
  );
  const contentType =
    artwork.evidence?.mime ||
    fileResponse.headers.get("content-type") ||
    "application/octet-stream";

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      "Content-Length": blob.byteLength.toString(),
      "Cache-Control": "private, no-store",
    },
  });
}

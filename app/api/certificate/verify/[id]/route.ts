import { NextRequest, NextResponse } from "next/server";

import { verifyCertificate } from "@/features/certificate-verify/server/verify-certificate";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    const result = await verifyCertificate(id);

    if (!result.found) {
        return NextResponse.json(
            {
                valid: false,
                message:
                    result.reason === "invalid_id"
                        ? "Invalid certificate identifier."
                        : "Certificate not found.",
            },
            { status: result.reason === "invalid_id" ? 400 : 404 },
        );
    }

    return NextResponse.json(result.data);
}

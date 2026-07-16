// ============================================
// POST /api/admin/recover-blockchain/[id] - Recover stuck blockchain registration
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { recoverBlockchainForArtwork } from "@/features/admin/artwork-verification/server/recover-blockchain";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Artwork ID is required" } },
        { status: 400 }
      );
    }

    const result = await recoverBlockchainForArtwork(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: result.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        txHash: result.txHash,
        workId: result.workId,
        chain: result.chain,
        blockNumber: result.blockNumber,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to recover blockchain registration";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
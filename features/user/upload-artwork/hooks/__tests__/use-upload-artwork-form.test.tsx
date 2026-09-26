import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LICENSE_ID } from "@/features/user/artwork-licensing/lib/licenses";
import { useUploadArtworkForm } from "@/features/user/upload-artwork/hooks/use-upload-artwork-form";
import type { UploadArtworkFormValues } from "@/features/user/upload-artwork/schemas/artwork-schema";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/cloudinary/direct-upload", () => ({
  uploadFileToCloudinary: vi.fn(),
}));

vi.mock("@/features/user/upload-artwork/server/upload-artwork", () => ({
  recordArtworkInDatabase: vi.fn(),
}));

vi.mock("@/features/user/upload-artwork/server/record-artwork-blockchain", () => ({
  recordArtworkOnBlockchain: vi.fn(),
}));

vi.mock("@/features/user/upload-artwork/server/retry-artwork-blockchain", () => ({
  retryArtworkOnBlockchain: vi.fn(),
}));

vi.mock("@/features/user/upload-artwork/server/submit-artwork-genre", () => ({
  submitArtworkGenres: vi.fn(),
}));

import { uploadFileToCloudinary } from "@/lib/cloudinary/direct-upload";
import { recordArtworkInDatabase } from "@/features/user/upload-artwork/server/upload-artwork";
import { recordArtworkOnBlockchain } from "@/features/user/upload-artwork/server/record-artwork-blockchain";
import { retryArtworkOnBlockchain } from "@/features/user/upload-artwork/server/retry-artwork-blockchain";

const ARTWORK_ID = "11111111-2222-3333-4444-555555555555";
const FAIL_MESSAGE = "could not coalesce error";

const mockUpload = vi.mocked(uploadFileToCloudinary);
const mockRecordInDatabase = vi.mocked(recordArtworkInDatabase);
const mockRecordOnBlockchain = vi.mocked(recordArtworkOnBlockchain);
const mockRetryOnBlockchain = vi.mocked(retryArtworkOnBlockchain);

function makeValues(): UploadArtworkFormValues {
  const file = new File(["art"], "art.png", { type: "image/png" });
  return {
    title: "My Artwork",
    description: "A test artwork",
    file,
    rightsConfirmed: true,
    licenseIdentifier: DEFAULT_LICENSE_ID,
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mockUpload.mockResolvedValue({
    publicId: "registered-arts/pub",
    assetId: "asset-id",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/art.png",
    format: "png",
    bytes: 1234,
    width: null,
    height: null,
  });

  mockRecordInDatabase.mockResolvedValue({
    success: true,
    artworkId: ARTWORK_ID,
    fileHash: "0xfile",
    perceptualHash: "0xpHash",
    authorIdHash: "0xauthor",
    evidenceHash: "0xevidence",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/art.png",
    message: "ready",
    similarityReport: null,
    artworkStatus: "pending_blockchain",
    genreSuggestions: [],
    otherMatches: null,
  });

  mockRecordOnBlockchain.mockResolvedValue({
    success: false,
    message: FAIL_MESSAGE,
  });
});

describe("useUploadArtworkForm — blockchain retry", () => {
  it("marks the artwork as retryable when the clean-path blockchain write fails", async () => {
    const { result } = renderHook(() => useUploadArtworkForm());

    act(() => {
      result.current.openConfirmation(makeValues());
    });

    await act(async () => {
      await result.current.confirmUpload();
    });

    expect(result.current.processingState).toBe("error");
    expect(result.current.blockchainFailed).toBe(true);
    expect(result.current.processingMessage).toBe(FAIL_MESSAGE);
    expect(mockRecordOnBlockchain).toHaveBeenCalledWith({
      artworkId: ARTWORK_ID,
      authorIdHash: "0xauthor",
      fileHash: "0xfile",
      perceptualHash: "0xpHash",
      evidenceHash: "0xevidence",
    });
  });

  it("retries the blockchain write and reopens the genre modal on success", async () => {
    const { result } = renderHook(() => useUploadArtworkForm());

    act(() => {
      result.current.openConfirmation(makeValues());
    });

    await act(async () => {
      await result.current.confirmUpload();
    });

    expect(result.current.blockchainFailed).toBe(true);

    mockRetryOnBlockchain.mockResolvedValue({
      success: true,
      txHash: "0xtx",
      blockNumber: 42,
      chain: "amoy",
      workId: "7",
    });

    await act(async () => {
      await result.current.retryBlockchain();
    });

    expect(mockRetryOnBlockchain).toHaveBeenCalledWith({
      artworkId: ARTWORK_ID,
    });
    expect(result.current.blockchainFailed).toBe(false);
    expect(result.current.genreModalOpen).toBe(true);
    expect(result.current.processingState).toBe("processing");
  });

  it("keeps the retry button available when the retry itself fails", async () => {
    const { result } = renderHook(() => useUploadArtworkForm());

    act(() => {
      result.current.openConfirmation(makeValues());
    });

    await act(async () => {
      await result.current.confirmUpload();
    });

    mockRetryOnBlockchain.mockResolvedValue({
      success: false,
      message: "still failing",
    });

    await act(async () => {
      await result.current.retryBlockchain();
    });

    expect(result.current.processingState).toBe("error");
    expect(result.current.blockchainFailed).toBe(true);
    expect(result.current.processingMessage).toBe("still failing");
    expect(result.current.genreModalOpen).toBe(false);
  });
});

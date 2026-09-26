import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockInvalidateQueries } = vi.hoisted(() => ({
  mockInvalidateQueries: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/user/upload-artwork/server/retry-artwork-blockchain", () => ({
  retryArtworkOnBlockchain: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/features/user/profile/hooks/useFetchProfileArtworks", () => ({
  artworkKeys: { all: () => ["artworks"] },
}));

vi.mock("@/features/user/profile/subfeatures/artwork-detail/hooks/useArtworkDetailPage", () => ({
  artworkDetailKeys: { byId: (id: string) => ["artwork-detail", id] },
}));

import { toast } from "sonner";
import { retryArtworkOnBlockchain } from "@/features/user/upload-artwork/server/retry-artwork-blockchain";
import { useRetryArtworkBlockchain } from "@/features/user/profile/subfeatures/artwork-detail/hooks/useRetryArtworkBlockchain";

const mockRetry = vi.mocked(retryArtworkOnBlockchain);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

const ARTWORK_ID = "11111111-2222-3333-4444-555555555555";

beforeEach(() => {
  vi.clearAllMocks();
  mockInvalidateQueries.mockResolvedValue(undefined);
});

describe("useRetryArtworkBlockchain", () => {
  it("exposes canRetry for retryable statuses without a blockchain record", () => {
    const { result } = renderHook(() =>
      useRetryArtworkBlockchain({ artId: ARTWORK_ID, status: "blockchain_failed" })
    );

    expect(result.current.canRetry).toBe(true);
  });

  it("does not expose canRetry for already-recorded artworks", () => {
    const { result } = renderHook(() =>
      useRetryArtworkBlockchain({
        artId: ARTWORK_ID,
        status: "active",
        txHash: "0xabc",
      })
    );

    expect(result.current.canRetry).toBe(false);
  });

  it("retries, invalidates caches, and toasts success", async () => {
    mockRetry.mockResolvedValue({
      success: true,
      txHash: "0xtx",
      blockNumber: 42,
      chain: "amoy",
      workId: "7",
    });

    const { result } = renderHook(() =>
      useRetryArtworkBlockchain({ artId: ARTWORK_ID, status: "blockchain_failed" })
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(mockRetry).toHaveBeenCalledWith({ artworkId: ARTWORK_ID });
    expect(mockInvalidateQueries).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it("toasts an error and skips invalidation on failure", async () => {
    mockRetry.mockResolvedValue({ success: false, message: "still failing" });

    const { result } = renderHook(() =>
      useRetryArtworkBlockchain({ artId: ARTWORK_ID, status: "blockchain_failed" })
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(mockToastError).toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

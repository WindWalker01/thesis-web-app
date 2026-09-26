import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockInvalidateQueries } = vi.hoisted(() => ({
    mockInvalidateQueries: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../server/update-artwork-genres", () => ({
    updateArtworkGenres: vi.fn(),
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

vi.mock("@/features/(user)/profile/hooks/useFetchProfileArtworks", () => ({
    artworkKeys: { all: () => ["artworks"] },
}));

vi.mock("../useArtworkDetailPage", () => ({
    artworkDetailKeys: { byId: (id: string) => ["artwork-detail", id] },
}));

import { toast } from "sonner";
import { updateArtworkGenres } from "../../server/update-artwork-genres";
import { useUpdateArtworkGenres } from "../useUpdateArtworkGenres";

const mockUpdate = vi.mocked(updateArtworkGenres);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

const ARTWORK_ID = "11111111-2222-3333-4444-555555555555";

beforeEach(() => {
    vi.clearAllMocks();
    mockInvalidateQueries.mockResolvedValue(undefined);
});

describe("useUpdateArtworkGenres", () => {
    it("saves genres, invalidates caches, and returns true on success", async () => {
        mockUpdate.mockResolvedValue({ success: true });
        const { result } = renderHook(() => useUpdateArtworkGenres(ARTWORK_ID));

        let ok = false;
        await act(async () => {
            ok = await result.current.save([1, 2]);
        });

        expect(ok).toBe(true);
        expect(mockUpdate).toHaveBeenCalledWith({
            artworkId: ARTWORK_ID,
            genreIds: [1, 2],
        });
        expect(mockInvalidateQueries).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it("returns false and toasts an error on failure", async () => {
        mockUpdate.mockResolvedValue({ success: false, message: "boom" });
        const { result } = renderHook(() => useUpdateArtworkGenres(ARTWORK_ID));

        let ok = true;
        await act(async () => {
            ok = await result.current.save([1]);
        });

        expect(ok).toBe(false);
        expect(mockToastError).toHaveBeenCalled();
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
});

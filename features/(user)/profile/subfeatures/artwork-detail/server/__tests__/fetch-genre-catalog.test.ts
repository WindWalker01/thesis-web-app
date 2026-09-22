// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchGenreCatalog } from "../fetch-genre-catalog";

const mockCreateServer = vi.mocked(createSupabaseServerClient);

beforeEach(() => {
    vi.clearAllMocks();
});

describe("fetchGenreCatalog", () => {
    it("returns the genre catalog on success", async () => {
        const order = vi.fn().mockResolvedValue({
            data: [
                { id: 1, name: "Abstract" },
                { id: 2, name: "Portrait" },
            ],
            error: null,
        });
        const from = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({ order }),
        });
        mockCreateServer.mockResolvedValue({ from } as never);

        const result = await fetchGenreCatalog();

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.genres).toEqual([
                { id: 1, name: "Abstract" },
                { id: 2, name: "Portrait" },
            ]);
        }
    });

    it("returns a failure message on error", async () => {
        const order = vi.fn().mockResolvedValue({
            data: null,
            error: { message: "boom" },
        });
        const from = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({ order }),
        });
        mockCreateServer.mockResolvedValue({ from } as never);

        const result = await fetchGenreCatalog();

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.message).toBe("boom");
        }
    });
});

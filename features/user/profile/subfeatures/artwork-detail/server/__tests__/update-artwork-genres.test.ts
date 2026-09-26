// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
    createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
    createSupabaseAdminClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateArtworkGenres } from "../update-artwork-genres";

const mockCreateServer = vi.mocked(createSupabaseServerClient);
const mockCreateAdmin = vi.mocked(createSupabaseAdminClient);

const ARTWORK_ID = "11111111-2222-3333-4444-555555555555";
const USER_ID = "user-1";

function makeServerClient({
    user = { id: USER_ID },
    authError = null,
    artwork = { id: ARTWORK_ID },
    fetchError = null,
}: {
    user?: { id: string } | null;
    authError?: { message: string } | null;
    artwork?: { id: string } | null;
    fetchError?: { message: string } | null;
} = {}) {
    const maybeSingle = vi
        .fn()
        .mockResolvedValue({ data: artwork, error: fetchError });

    const from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({ maybeSingle }),
            }),
        }),
    });

    return {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
        },
        from,
    };
}

function makeAdminClient({
    deleteError = null,
    insertError = null,
}: {
    deleteError?: { message: string } | null;
    insertError?: { message: string } | null;
} = {}) {
    const deleteEq = vi.fn().mockResolvedValue({ data: null, error: deleteError });
    const insert = vi.fn().mockResolvedValue({ data: null, error: insertError });

    const from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({ eq: deleteEq }),
        insert,
    });

    return { from, deleteEq, insert };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("updateArtworkGenres", () => {
    it("rejects an empty genreIds array", async () => {
        mockCreateServer.mockResolvedValue(makeServerClient() as never);
        mockCreateAdmin.mockReturnValue(makeAdminClient() as never);

        const result = await updateArtworkGenres({
            artworkId: ARTWORK_ID,
            genreIds: [],
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.message).toContain("At least one genre");
        }
    });

    it("rejects non-integer genre ids", async () => {
        mockCreateServer.mockResolvedValue(makeServerClient() as never);
        mockCreateAdmin.mockReturnValue(makeAdminClient() as never);

        const result = await updateArtworkGenres({
            artworkId: ARTWORK_ID,
            genreIds: [1.5] as unknown as number[],
        });

        expect(result.success).toBe(false);
    });

    it("fails when the artwork is not found or not owned", async () => {
        mockCreateServer.mockResolvedValue(
            makeServerClient({ artwork: null }) as never
        );
        mockCreateAdmin.mockReturnValue(makeAdminClient() as never);

        const result = await updateArtworkGenres({
            artworkId: ARTWORK_ID,
            genreIds: [1],
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.message).toContain("not found");
        }
    });

    it("deletes existing rows and inserts the new set via the admin client", async () => {
        mockCreateServer.mockResolvedValue(makeServerClient() as never);
        const admin = makeAdminClient();
        mockCreateAdmin.mockReturnValue(admin as never);

        const result = await updateArtworkGenres({
            artworkId: ARTWORK_ID,
            genreIds: [1, 2],
        });

        expect(result.success).toBe(true);
        expect(admin.deleteEq).toHaveBeenCalledWith("art_id", ARTWORK_ID);
        expect(admin.insert).toHaveBeenCalledWith([
            { art_id: ARTWORK_ID, genre_id: 1 },
            { art_id: ARTWORK_ID, genre_id: 2 },
        ]);
    });

    it("fails when the delete step errors", async () => {
        mockCreateServer.mockResolvedValue(makeServerClient() as never);
        mockCreateAdmin.mockReturnValue(
            makeAdminClient({ deleteError: { message: "delete boom" } }) as never
        );

        const result = await updateArtworkGenres({
            artworkId: ARTWORK_ID,
            genreIds: [1],
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.message).toBe("delete boom");
        }
    });
});

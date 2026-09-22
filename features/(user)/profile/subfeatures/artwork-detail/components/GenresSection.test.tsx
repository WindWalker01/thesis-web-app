import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../hooks/useGenres", () => ({
    useGenres: vi.fn(),
}));

vi.mock("../hooks/useUpdateArtworkGenres", () => ({
    useUpdateArtworkGenres: vi.fn(),
}));

import { useGenres } from "../hooks/useGenres";
import { useUpdateArtworkGenres } from "../hooks/useUpdateArtworkGenres";
import { GenresSection } from "./GenresSection";

const mockUseGenres = vi.mocked(useGenres);
const mockUseUpdate = vi.mocked(useUpdateArtworkGenres);

const CATALOG = [
    { id: 1, name: "Abstract" },
    { id: 2, name: "Portrait" },
    { id: 3, name: "Landscape" },
];

beforeEach(() => {
    vi.clearAllMocks();
    mockUseGenres.mockReturnValue({
        genres: CATALOG,
        isLoading: false,
        error: null,
    });
    mockUseUpdate.mockReturnValue({
        isSaving: false,
        save: vi.fn().mockResolvedValue(true),
    });
});

describe("GenresSection", () => {
    it("renders assigned genres and opens the editor dialog", async () => {
        render(
            <GenresSection artId="art-1" genres={[{ id: 1, name: "Abstract" }]} />
        );

        expect(screen.getByText("Abstract")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /edit genres/i }));

        await waitFor(() => {
            expect(screen.getByText("Edit genre tags")).toBeInTheDocument();
        });
    });

    it("saves the selected genre ids", async () => {
        const save = vi.fn().mockResolvedValue(true);
        mockUseUpdate.mockReturnValue({ isSaving: false, save });

        render(
            <GenresSection artId="art-1" genres={[{ id: 1, name: "Abstract" }]} />
        );

        fireEvent.click(screen.getByRole("button", { name: /edit genres/i }));

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Portrait" })
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: "Portrait" }));
        fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
            expect(save).toHaveBeenCalledWith([1, 2]);
        });
    });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useProfilePage } from "@/features/user/profile/hooks/useProfilePage";
import type { Artwork } from "@/features/user/profile/types";

const SORT_OPTIONS = ["Newest First", "Oldest First"] as const;

function makeArtwork(overrides: Partial<Artwork> = {}): Artwork {
  return {
    id: "art-1",
    title: "Sunset",
    description: null,
    img: null,
    category: "Abstract",
    uploadDate: "2024-01-01",
    ownershipStatus: "verified",
    hashStatus: "complete",
    color: "#000",
    createdAt: "2024-01-01T00:00:00.000Z",
    status: "active",
    txHash: null,
    chain: null,
    workId: null,
    blockNumber: null,
    hasBlockchainRecord: false,
    canEdit: true,
    canDelete: true,
    ...overrides,
  };
}

describe("useProfilePage", () => {
  it("keeps the sidebar open on wide viewports by default", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() =>
      useProfilePage([makeArtwork()], SORT_OPTIONS),
    );

    expect(result.current.sidebarOpen).toBe(true);
  });

  it("closes the sidebar when the viewport crosses below the mobile breakpoint", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() =>
      useProfilePage([makeArtwork()], SORT_OPTIONS),
    );

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.sidebarOpen).toBe(false);
  });

  it("filters artworks by search query", () => {
    const { result } = renderHook(() =>
      useProfilePage(
        [
          makeArtwork({ title: "Sunset" }),
          makeArtwork({ id: "art-2", title: "Ocean" }),
        ],
        SORT_OPTIONS,
      ),
    );

    act(() => {
      result.current.setSearchQuery("ocean");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.title).toBe("Ocean");
  });
});

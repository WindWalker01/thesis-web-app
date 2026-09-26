import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useArtworkFilePreview } from "@/features/user/upload-artwork/hooks/use-artwork-file-preview";

describe("useArtworkFilePreview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when no file is provided", () => {
    const { result } = renderHook(() => useArtworkFilePreview(undefined));
    expect(result.current).toBeNull();
  });

  it("creates and revokes an object URL for the selected file", () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:preview");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    const file = new File(["art"], "art.png", { type: "image/png" });
    const { result, unmount, rerender } = renderHook<
      string | null,
      { file: File | undefined }
    >(({ file }) => useArtworkFilePreview(file), {
      initialProps: { file },
    });

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(result.current).toBe("blob:preview");

    rerender({ file: undefined });
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(result.current).toBeNull();

    unmount();
  });
});

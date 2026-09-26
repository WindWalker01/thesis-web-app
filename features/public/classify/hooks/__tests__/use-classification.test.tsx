import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useClassification } from "../useClassification";

const { mockClassify } = vi.hoisted(() => ({ mockClassify: vi.fn() }));

vi.mock("@/features/classify/lib/api-client", () => ({
  classifyArtworkFile: mockClassify,
}));

function makeFile(): File {
  return new File([new ArrayBuffer(8)], "test.png", { type: "image/png" });
}

describe("useClassification — browser-direct transport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn().mockReturnValue(
      "blob:mock-url",
    ) as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("classifies via the browser-direct helper and surfaces predictions", async () => {
    mockClassify.mockResolvedValue({
      success: true,
      message: "Genre classification completed successfully.",
      predictions: [{ label: "Portrait", score: 0.9 }],
    });

    const { result } = renderHook(() => useClassification());

    act(() => {
      result.current.handleFileSelect(makeFile());
    });

    await act(async () => {
      await result.current.onSubmit({ file: makeFile() });
    });

    expect(mockClassify).toHaveBeenCalledOnce();
    expect(mockClassify.mock.calls[0][0]).toBeInstanceOf(File);
    expect(result.current.result).toEqual([{ label: "Portrait", score: 0.9 }]);
    expect(result.current.serverMessage).toBe(
      "Genre classification completed successfully.",
    );
  });

  it("maps transport failures to actionable guidance without setting predictions", async () => {
    mockClassify.mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useClassification());

    act(() => {
      result.current.handleFileSelect(makeFile());
    });

    await act(async () => {
      await result.current.onSubmit({ file: makeFile() });
    });

    expect(result.current.result).toBeNull();
    expect(result.current.serverMessage).toMatch(/internet connection/i);
  });
});

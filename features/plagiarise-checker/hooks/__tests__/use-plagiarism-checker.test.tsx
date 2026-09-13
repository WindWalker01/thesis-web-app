import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlagiarismChecker } from "../use-plagiarism-checker";
import type {
  CompareResponse,
  SearchResponse,
} from "@/features/plagiarise-checker/types";

const { mockCompareFiles, mockWebCheck, mockReportPdf } = vi.hoisted(() => ({
  mockCompareFiles: vi.fn(),
  mockWebCheck: vi.fn(),
  mockReportPdf: vi.fn(),
}));

vi.mock("@/features/plagiarise-checker/lib/api-client", () => ({
  checkPlagiarismCompareFiles: mockCompareFiles,
}));

vi.mock("@/features/plagiarise-checker/server/check-plagiarism-web", () => ({
  checkPlagiarismWeb: mockWebCheck,
}));

vi.mock("@/features/plagiarise-checker/lib/plagiarism-report", () => ({
  generatePlagiarismReportPdf: mockReportPdf,
}));

function makeFile(name: string): File {
  return new File([new ArrayBuffer(8)], name, { type: "image/png" });
}

function makeCompareResponse(): CompareResponse {
  return {
    image1: "a.png",
    image2: "b.png",
    comparison: {
      transform_similarity: 0.1,
      block_similarity: 0.2,
      final_similarity: 0.15,
    },
  };
}

function makeSearchResponse(): SearchResponse {
  return {
    filename: "w.png",
    success: true,
    original_hash: "abc123",
    hashes: { transforms: {}, blocks: {} },
    other_matches: [],
  };
}

describe("usePlagiarismChecker — compare mode transport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom lacks blob URL statics; the hook's upload handlers need them.
    URL.createObjectURL = vi.fn().mockReturnValue(
      "blob:mock-url",
    ) as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends compare uploads browser→backend directly and lands on result", async () => {
    const response = makeCompareResponse();
    mockCompareFiles.mockResolvedValue(response);

    const { result } = renderHook(() => usePlagiarismChecker());

    const fileA = makeFile("a.png");
    const fileB = makeFile("b.png");

    act(() => {
      result.current.handleCompareUploadA(fileA);
      result.current.handleCompareUploadB(fileB);
    });
    expect(result.current.stage).toBe("upload");

    await act(async () => {
      await result.current.handleCompare();
    });

    expect(mockCompareFiles).toHaveBeenCalledOnce();
    expect(mockCompareFiles).toHaveBeenCalledWith(fileA, fileB);
    expect(result.current.stage).toBe("result");
    expect(result.current.compareResult).toEqual(response);
    expect(result.current.error).toBeNull();
  });

  it("maps the server-action transport failure to actionable size guidance", async () => {
    mockCompareFiles.mockRejectedValue(
      new Error("An unexpected response was received from the server."),
    );

    const { result } = renderHook(() => usePlagiarismChecker());

    act(() => {
      result.current.handleCompareUploadA(makeFile("a.png"));
      result.current.handleCompareUploadB(makeFile("b.png"));
    });

    await act(async () => {
      await result.current.handleCompare();
    });

    expect(result.current.stage).toBe("error");
    expect(result.current.error).toMatch(/too large/i);
    expect(result.current.errorTime).toBeInstanceOf(Date);
  });

  it("surfaces backend detail errors verbatim", async () => {
    mockCompareFiles.mockRejectedValue(new Error("Images must be PNG or JPEG"));

    const { result } = renderHook(() => usePlagiarismChecker());

    act(() => {
      result.current.handleCompareUploadA(makeFile("a.png"));
      result.current.handleCompareUploadB(makeFile("b.png"));
    });

    await act(async () => {
      await result.current.handleCompare();
    });

    expect(result.current.stage).toBe("error");
    expect(result.current.error).toBe("Images must be PNG or JPEG");
  });

  it("does not start an analysis without both files selected", async () => {
    const { result } = renderHook(() => usePlagiarismChecker());

    act(() => {
      result.current.handleCompareUploadA(makeFile("a.png"));
    });

    await act(async () => {
      await result.current.handleCompare();
    });

    expect(mockCompareFiles).not.toHaveBeenCalled();
    expect(result.current.stage).toBe("upload");
  });
});

describe("usePlagiarismChecker — web mode (unchanged server-action path)", () => {
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

  it("still routes web uploads through the server action with a FormData file", async () => {
    mockWebCheck.mockResolvedValue({ success: true, data: makeSearchResponse() });

    const { result } = renderHook(() => usePlagiarismChecker());

    const file = makeFile("w.png");
    await act(async () => {
      await result.current.handleWebUpload(file);
    });

    expect(mockWebCheck).toHaveBeenCalledOnce();
    expect(mockCompareFiles).not.toHaveBeenCalled();

    const [, formData] = mockWebCheck.mock.calls[0] as [unknown, FormData];
    expect(formData.get("file")).toBe(file);
    expect(result.current.stage).toBe("result");
    expect(result.current.webResult).toEqual(makeSearchResponse());
  });
});

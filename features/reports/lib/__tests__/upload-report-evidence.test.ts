import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { uploadReportEvidence } from "../upload-report-evidence";

const { mockUploadToSignedUrl } = vi.hoisted(() => ({
  mockUploadToSignedUrl: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({ uploadToSignedUrl: mockUploadToSignedUrl }),
    },
  },
}));

function makeFile(): File {
  return new File([new ArrayBuffer(8)], "proof.png", { type: "image/png" });
}

describe("uploadReportEvidence — signed, browser-direct flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubFetchSequence(
    ticket: unknown,
    finalized: unknown,
    ticketOk = true,
    finalOk = true,
  ) {
    return vi
      .fn()
      .mockResolvedValueOnce({ ok: ticketOk, json: async () => ticket })
      .mockResolvedValueOnce({ ok: finalOk, json: async () => finalized });
  }

  it("requests a ticket, PUTs the file to Storage, then finalizes (JSON only)", async () => {
    mockUploadToSignedUrl.mockResolvedValue({ error: null });
    const mockFetch = stubFetchSequence(
      { success: true, data: { storagePath: "reports/r-1/1_p.png", token: "t-1" } },
      { success: true, data: { id: "e-1", file_name: "proof.png" } },
    );
    vi.stubGlobal("fetch", mockFetch);

    const file = makeFile();
    const result = await uploadReportEvidence({
      reportId: "r-1",
      file,
      description: "shot",
    });

    expect(result).toMatchObject({ id: "e-1" });

    // Step 1 — ticket request is JSON (no file bytes)
    const [ticketUrl, ticketInit] = mockFetch.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(ticketUrl).toBe("/api/reports/r-1/evidence");
    expect(JSON.parse(ticketInit.body as string)).toMatchObject({
      fileName: "proof.png",
      size: 8,
      description: "shot",
    });

    // Step 2 — raw file goes straight to Storage
    expect(mockUploadToSignedUrl).toHaveBeenCalledWith(
      "reports/r-1/1_p.png",
      "t-1",
      file,
    );

    // Step 3 — finalize is JSON
    const [finalizeUrl, finalizeInit] = mockFetch.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(finalizeUrl).toBe("/api/reports/r-1/evidence");
    expect(JSON.parse(finalizeInit.body as string)).toMatchObject({
      storagePath: "reports/r-1/1_p.png",
    });
  });

  it("throws the ticket error message when the ticket is refused", async () => {
    vi.stubGlobal(
      "fetch",
      stubFetchSequence(
        {
          success: false,
          error: { message: "Not authorized to upload evidence to this report" },
        },
        {},
      ),
    );

    await expect(
      uploadReportEvidence({ reportId: "r-1", file: makeFile() }),
    ).rejects.toThrow(/Not authorized/);
    expect(mockUploadToSignedUrl).not.toHaveBeenCalled();
  });

  it("throws when the Storage PUT fails", async () => {
    mockUploadToSignedUrl.mockResolvedValue({
      error: { message: "storage error" },
    });
    vi.stubGlobal(
      "fetch",
      stubFetchSequence(
        { success: true, data: { storagePath: "p", token: "t" } },
        {},
      ),
    );

    await expect(
      uploadReportEvidence({ reportId: "r-1", file: makeFile() }),
    ).rejects.toThrow("Failed to upload file: storage error");
  });

  it("throws when finalize is refused", async () => {
    mockUploadToSignedUrl.mockResolvedValue({ error: null });
    vi.stubGlobal(
      "fetch",
      stubFetchSequence(
        { success: true, data: { storagePath: "p", token: "t" } },
        { success: false, error: { message: "Invalid storage path" } },
        true,
        false,
      ),
    );

    await expect(
      uploadReportEvidence({ reportId: "r-1", file: makeFile() }),
    ).rejects.toThrow("Invalid storage path");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({
  select: mockSelect,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { getRuntimeSettings } from "./runtime-settings";

describe("getRuntimeSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads the latest persisted threshold values instead of reusing stale in-memory settings", async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [{ key: "similarity_threshold", value: 80 }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ key: "similarity_threshold", value: 92 }],
        error: null,
      });

    const first = await getRuntimeSettings();
    expect(first.similarity_threshold).toBe(80);

    const second = await getRuntimeSettings();
    expect(second.similarity_threshold).toBe(92);
  });
});

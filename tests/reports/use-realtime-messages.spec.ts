import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReportComment, ChatMessage } from "@/features/reports/types";
import { useRealtimeMessages } from "@/features/reports/hooks/useRealtimeMessages";

// ---------------------------------------------------------------------------
// Mock the Supabase browser client so the hook's Realtime subscription is
// driven entirely by a controllable fake channel.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  type InsertHandler = (payload: { new: ReportComment }) => void;

  type FakeChannel = {
    on: (
      event: string,
      config: unknown,
      callback: InsertHandler,
    ) => FakeChannel;
    subscribe: (callback: (status: string) => void) => FakeChannel;
    unsubscribe: () => void;
    emitInsert: (payload: { new: ReportComment }) => void;
    subscribeCallback: ((status: string) => void) | null;
  };

  let current: FakeChannel | null = null;

  function createFakeChannel() {
    const insertHandlers: InsertHandler[] = [];

    const channel: FakeChannel = {
      on: vi.fn((_event: string, _config: unknown, callback: InsertHandler) => {
        insertHandlers.push(callback);
        return channel;
      }),
      subscribe: vi.fn((callback: (status: string) => void) => {
        channel.subscribeCallback = callback;
        callback("SUBSCRIBED");
        return channel;
      }),
      unsubscribe: vi.fn(() => {}),
      emitInsert: (payload) => {
        for (const handler of insertHandlers) handler(payload);
      },
      subscribeCallback: null,
    };

    current = channel;
    return channel;
  }

  return {
    createFakeChannel,
    getCurrent: () => current,
  };
});

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    channel: vi.fn((_name: string) => hoisted.createFakeChannel()),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeComment(overrides: Partial<ReportComment> = {}): ReportComment {
  return {
    id: "db-comment-1",
    report_id: "report-1",
    user_id: "user-1",
    message: "hello",
    is_admin: false,
    created_at: "2026-08-02T09:00:00.000Z",
    read_at: null,
    file_url: null,
    file_name: null,
    mime_type: null,
    message_type: "text",
    parent_id: null,
    ...overrides,
  };
}

const fetchMock = vi.fn();
function mockFetchOk(data: ReportComment) {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data }),
  });
}

function makeSetupOptions(
  overrides: Partial<{
    reportId: string;
    currentUserId: string;
    initialMessages?: ReportComment[];
    enabled?: boolean;
  }> = {},
) {
  return {
    reportId: overrides.reportId ?? "report-1",
    currentUserId: overrides.currentUserId ?? "user-1",
    initialMessages: overrides.initialMessages,
    enabled: overrides.enabled,
  };
}

afterEach(() => {
  hoisted.getCurrent()?.unsubscribe();
});

// ---------------------------------------------------------------------------
// Tests — send path (immediate optimistic render + authoritative replacement)
// ---------------------------------------------------------------------------
describe("useRealtimeMessages — send path", () => {
  it("renders the authoritative server comment immediately after a successful send", async () => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    const serverComment = makeComment({
      id: "db-1",
      message: "hello from the reporter",
      user_id: "user-1",
      is_admin: false,
      message_type: "text",
      created_at: "2026-08-02T09:00:00.000Z",
    });
    mockFetchOk(serverComment);

    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions()),
    );

    let resolved: ChatMessage | undefined;
    await act(async () => {
      resolved = await result.current.sendMessage("hello from the reporter");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/reports/report-1/comments",
      expect.objectContaining({ method: "POST" }),
    );
    expect(resolved?.id).toBe("db-1");
    expect(resolved?.status).toBe("sent");

    await waitFor(() => {
      const messages = result.current.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe("db-1");
      expect(messages[0].message).toBe("hello from the reporter");
      expect(messages[0].user_id).toBe("user-1");
      expect(messages[0].is_admin).toBe(false);
      expect(messages[0].message_type).toBe("text");
      expect(messages[0].status).toBe("sent");
      expect(messages[0].created_at).toBe("2026-08-02T09:00:00.000Z");
      // No temp/optimistic ghost remains
      expect(messages.some((m) => m.temp_id)).toBe(false);
    });

    vi.unstubAllGlobals();
  });

  it("preserves attachment fields on the returned server comment", async () => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    const serverComment = makeComment({
      id: "db-file-1",
      file_url: "https://example.com/report.pdf",
      file_name: "report.pdf",
      mime_type: "application/pdf",
      message_type: "document",
    });
    mockFetchOk(serverComment);

    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions()),
    );

    await act(async () => {
      await result.current.sendMessage("see attachment");
    });

    await waitFor(() => {
      const message = result.current.messages[0];
      expect(message.file_url).toBe("https://example.com/report.pdf");
      expect(message.file_name).toBe("report.pdf");
      expect(message.mime_type).toBe("application/pdf");
      expect(message.message_type).toBe("document");
    });

    vi.unstubAllGlobals();
  });

  it("rolls back the optimistic message when the send fails", async () => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    let rejectFetch!: (reason?: unknown) => void;
    const pendingFetch = new Promise<Response>((_resolve, reject) => {
      rejectFetch = reject;
    });
    fetchMock.mockReturnValue(pendingFetch);

    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions()),
    );

    // Start the send while the request is pending.
    let sendPromise: Promise<ChatMessage> | undefined;
    act(() => {
      sendPromise = result.current.sendMessage("will fail");
    });

    // The optimistic message becomes visible immediately while pending.
    await waitFor(() => {
      expect(result.current.messages.some((m) => m.temp_id)).toBe(true);
    });

    // Reject the request inside act and drain the rejection.
    await act(async () => {
      rejectFetch(new Error("boom"));
      try {
        await sendPromise;
      } catch {
        // Expected rejection from the failed send.
      }
    });

    // Optimistic message rolled back.
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(0);
    });

    vi.unstubAllGlobals();
  });
});

// ---------------------------------------------------------------------------
// Tests — realtime delivery & reconciliation
// ---------------------------------------------------------------------------
describe("useRealtimeMessages — realtime / reconciliation", () => {
  it("adds an incoming admin message received via Realtime", async () => {
    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions()),
    );

    const adminComment = makeComment({
      id: "db-admin-1",
      user_id: "admin-1",
      is_admin: true,
      message: "We are reviewing your report",
      created_at: "2026-08-02T09:05:00.000Z",
    });

    await act(async () => {
      hoisted.getCurrent()?.emitInsert({ new: adminComment });
    });

    await waitFor(() => {
      const messages = result.current.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe("db-admin-1");
      expect(messages[0].user_id).toBe("admin-1");
      expect(messages[0].is_admin).toBe(true);
      expect(messages[0].status).toBe("delivered");
    });
  });

  it("initializes base messages from initialMessages (page refresh)", async () => {
    const initial = [
      makeComment({ id: "db-1", created_at: "2026-08-02T09:00:00.000Z" }),
      makeComment({
        id: "db-2",
        message: "second",
        created_at: "2026-08-02T09:01:00.000Z",
      }),
    ];

    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions({ initialMessages: initial })),
    );

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });
    expect(result.current.messages.map((m) => m.id)).toEqual(["db-1", "db-2"]);
    expect(result.current.messages.map((m) => m.status)).toEqual([
      "sent",
      "sent",
    ]);
  });

  it("sorts multiple messages by created_at ascending", async () => {
    const initial = [
      makeComment({ id: "db-2", created_at: "2026-08-02T09:10:00.000Z" }),
      makeComment({ id: "db-1", created_at: "2026-08-02T09:00:00.000Z" }),
    ];

    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions({ initialMessages: initial })),
    );

    await waitFor(() => {
      expect(result.current.messages.map((m) => m.id)).toEqual([
        "db-1",
        "db-2",
      ]);
    });
  });

  it("does not duplicate a self message when Realtime delivers it after POST success", async () => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    const serverComment = makeComment({ id: "db-1" });
    mockFetchOk(serverComment);

    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions()),
    );

    await act(async () => {
      await result.current.sendMessage("hello");
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    // Realtime self-insert arrives after the authoritative row is already in state
    await act(async () => {
      hoisted.getCurrent()?.emitInsert({ new: serverComment });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].id).toBe("db-1");

    vi.unstubAllGlobals();
  });

  it("reconciles the optimistic message when Realtime fires before POST resolves (race)", async () => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    let resolveFetch!: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    fetchMock.mockReturnValue(pendingFetch);

    const serverComment = makeComment({
      id: "db-1",
      message: "race message",
      created_at: "2026-08-02T09:00:00.000Z",
    });

    const { result } = renderHook(() =>
      useRealtimeMessages(makeSetupOptions()),
    );

    // Start the send but keep POST pending
    let sendPromise:
      Promise<import("@/features/reports/types").ChatMessage> | undefined;
    act(() => {
      sendPromise = result.current.sendMessage("race message");
    });

    // Optimistic message is visible while POST is in flight
    await waitFor(() => {
      expect(result.current.messages.some((m) => m.temp_id)).toBe(true);
    });

    // Realtime delivers the authoritative DB row before the POST resolves
    await act(async () => {
      hoisted.getCurrent()?.emitInsert({ new: serverComment });
    });

    // Resolve the POST
    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({ success: true, data: serverComment }),
      } as Response);
      await sendPromise;
    });

    await waitFor(() => {
      const messages = result.current.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe("db-1");
      expect(messages[0].status).toBe("sent");
      expect(messages.some((m) => m.temp_id)).toBe(false);
    });

    vi.unstubAllGlobals();
  });
});

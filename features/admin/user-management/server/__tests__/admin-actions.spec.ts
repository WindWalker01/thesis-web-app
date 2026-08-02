import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { banUser, bulkBanUsers } from "../admin-actions";

type AuditRow = Record<string, unknown>;

interface Ctx {
  target?: { id: string; role: string; account_status: string } | null;
  bulkTargets?: Array<{ id: string; role: string; account_status: string }>;
  auditInserts: AuditRow[];
  notificationInserts: AuditRow[];
}

/**
 * Builds a thenable query chain. The `then` method resolves via the resolver so
 * `await supabase.from(...)...` yields the resolver's value.
 */
function usersChain(ctx: Ctx, kind: "single" | "bulk") {
  let lastSelect = "";
  const q: Record<string, (...args: unknown[]) => unknown> = {};
  const methods = [
    "select",
    "eq",
    "neq",
    "in",
    "single",
    "maybeSingle",
    "update",
  ];
  for (const m of methods) {
    q[m] = ((...args: unknown[]) => {
      if (m === "select") lastSelect = args[0] as string;
      return q;
    }) as (...args: unknown[]) => unknown;
  }
  q.then = ((onFulfilled: (v: unknown) => void) => {
    let data: unknown;
    const bulkTargetLookup =
      kind === "bulk" && lastSelect.includes("account_status");
    if (bulkTargetLookup) {
      data = ctx.bulkTargets ?? [];
    } else if (lastSelect.includes("account_status")) {
      data = ctx.target ?? null;
    } else {
      // Admin profile lookup uses select("role").
      data = { role: "admin" };
    }
    onFulfilled({ data, error: null });
  }) as (...args: unknown[]) => unknown;
  return q;
}

function makeSupabase(ctx: Ctx, kind: "single" | "bulk") {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      }),
    },
    from: vi.fn((table: string): unknown => {
      if (table === "users") return usersChain(ctx, kind);
      if (table === "admin_audit_logs") {
        return {
          insert: vi.fn((rows: AuditRow | AuditRow[]) => {
            ctx.auditInserts.push(...(Array.isArray(rows) ? rows : [rows]));
            return { error: null };
          }),
        };
      }
      if (table === "notifications") {
        return {
          insert: vi.fn((rows: AuditRow | AuditRow[]) => {
            ctx.notificationInserts.push(
              ...(Array.isArray(rows) ? rows : [rows]),
            );
            return { error: null };
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

const getSupabaseMock = createSupabaseServerClient as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  getSupabaseMock.mockReset();
});

describe("banUser", () => {
  it("rejects an already-banned account idempotently without audit/notification", async () => {
    const ctx: Ctx = {
      target: { id: "user-1", role: "user", account_status: "banned" },
      auditInserts: [],
      notificationInserts: [],
    };
    getSupabaseMock.mockResolvedValue(makeSupabase(ctx, "single"));

    const result = await banUser({
      user_id: "user-1",
      reason: "Repeated ban attempt",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("already banned");
    expect(ctx.auditInserts).toHaveLength(0);
    expect(ctx.notificationInserts).toHaveLength(0);
  });

  it("records the real previous account_status when banning a suspended user", async () => {
    const ctx: Ctx = {
      target: { id: "user-1", role: "user", account_status: "suspended" },
      auditInserts: [],
      notificationInserts: [],
    };
    getSupabaseMock.mockResolvedValue(makeSupabase(ctx, "single"));

    const result = await banUser({
      user_id: "user-1",
      reason: "Violation of terms",
    });

    expect(result.success).toBe(true);
    expect(ctx.auditInserts).toHaveLength(1);
    expect(ctx.auditInserts[0].previous_value).toBe("suspended");
    expect(ctx.auditInserts[0].new_value).toBe("banned");
    expect(ctx.auditInserts[0].action).toBe("ban_user");
  });
});

describe("bulkBanUsers", () => {
  it("skips already-banned users and only audits/notifies changed users", async () => {
    const ctx: Ctx = {
      bulkTargets: [
        { id: "user-active", role: "user", account_status: "active" },
        { id: "user-banned", role: "user", account_status: "banned" },
        { id: "user-suspended", role: "user", account_status: "suspended" },
      ],
      auditInserts: [],
      notificationInserts: [],
    };
    getSupabaseMock.mockResolvedValue(makeSupabase(ctx, "bulk"));

    const result = await bulkBanUsers(
      ["user-active", "user-banned", "user-suspended"],
      "Mass ban",
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain("2");

    expect(ctx.auditInserts).toHaveLength(2);
    expect(
      ctx.auditInserts.find((a) => a.target_user_id === "user-banned"),
    ).toBeUndefined();
    expect(
      ctx.auditInserts.find((a) => a.target_user_id === "user-active")
        ?.previous_value,
    ).toBe("active");
    expect(
      ctx.auditInserts.find((a) => a.target_user_id === "user-suspended")
        ?.previous_value,
    ).toBe("suspended");
    expect(ctx.notificationInserts).toHaveLength(2);
  });
});
